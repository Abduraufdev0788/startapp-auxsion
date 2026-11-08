import json
import uuid
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import PaymentStatus, PaymentType
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)
from app.integrations.payments.factory import get_payment_provider
from app.modules.auctions.repository import AuctionRepository
from app.modules.deposits.repository import DepositRepository
from app.modules.escrow.service import LedgerService
from app.modules.payments.models import PaymentTransactionModel
from app.modules.payments.repository import PaymentRepository
from app.modules.payments.schemas import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    WinnerSettlementRequest,
)
from app.utils.idempotency import generate_idempotency_key
from app.utils.money import format_uzs, uzs_to_tiyin


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PaymentRepository(db)
        self.auction_repo = AuctionRepository(db)
        self.deposit_repo = DepositRepository(db)
        self.ledger_service = LedgerService(db)
        self.provider = get_payment_provider()

    async def initiate_payment(
        self, user_id: uuid.UUID, data: PaymentInitiateRequest
    ) -> PaymentInitiateResponse:
        auction = await self.auction_repo.get_by_id(data.auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        amount_tiyin = uzs_to_tiyin(data.amount_uzs)
        idempotency_key = generate_idempotency_key("pay")

        # 1. Create Transaction in PENDING status
        txn = await self.repo.create_transaction(
            user_id=user_id,
            transaction_type=data.transaction_type,
            amount_tiyin=amount_tiyin,
            provider=settings.PAYMENT_PROVIDER,
            idempotency_key=idempotency_key,
            status=PaymentStatus.PENDING.value,
        )

        # 2. Get checkout URL from provider
        return_url = f"{settings.FRONTEND_URL}/payment-success?txn={txn.id}"
        provider_res = await self.provider.create_payment(
            order_id=str(txn.id),
            amount_tiyin=amount_tiyin,
            description=f"AuctionHub {data.transaction_type} for auction {auction.id}",
            return_url=return_url,
        )

        txn.provider_transaction_id = provider_res.provider_transaction_id
        await self.db.commit()

        return PaymentInitiateResponse(
            transaction_id=txn.id,
            provider_transaction_id=provider_res.provider_transaction_id,
            checkout_url=provider_res.checkout_url,
            amount=amount_tiyin,
            currency="UZS",
        )

    async def process_webhook(
        self, provider_name: str, payload_bytes: bytes, signature_header: str
    ) -> Dict[str, Any]:
        """Verify webhook signature and safely transition payment status."""
        # 1. Verify provider signature
        try:
            await self.provider.verify_webhook(payload_bytes, signature_header)
        except Exception:
            raise UnauthorizedException("Yaroqsiz to'lov webhook imzosi", error_code="INVALID_SIGNATURE")

        data = json.loads(payload_bytes.decode("utf-8"))
        event_id = data.get("event_id") or str(uuid.uuid4())

        # 2. Prevent replay attacks (duplicate webhook events)
        existing_event = await self.repo.get_webhook_event(event_id)
        if existing_event:
            return {"status": "ALREADY_PROCESSED"}

        order_id = uuid.UUID(data["order_id"])
        txn = await self.repo.get_by_id(order_id)
        if not txn:
            raise NotFoundException("Tranzaksiya topilmadi", error_code="TRANSACTION_NOT_FOUND")

        if txn.status == PaymentStatus.COMPLETED.value:
            return {"status": "ALREADY_COMPLETED"}

        # 3. Transition to COMPLETED
        await self.repo.update_status(
            txn=txn,
            status=PaymentStatus.COMPLETED.value,
            provider_transaction_id=data.get("provider_transaction_id"),
        )
        await self.repo.record_webhook_event(
            provider=provider_name,
            event_id=event_id,
            payload=payload_bytes.decode("utf-8"),
        )

        # 4. Double-Entry Financial Ledger Entry
        await self.ledger_service.record_transfer(
            transaction_id=txn.id,
            from_account_type="USER_WALLET",
            to_account_type="PLATFORM_ESCROW",
            amount_tiyin=txn.amount,
            description=f"Received payment via {provider_name}",
            from_user_id=txn.user_id,
        )

        await self.db.commit()
        return {"status": "SUCCESS"}

    async def settle_winner_payment(
        self, user_id: uuid.UUID, data: WinnerSettlementRequest
    ) -> Dict[str, Any]:
        """Process winner remaining purchase balance settlement."""
        auction = await self.auction_repo.get_by_id(data.auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        if not auction.result or auction.result.winner_id != user_id:
            raise ForbiddenException("Faqat auksion g'olibi yakuniy to'lovni amalga oshira oladi")

        if auction.result.payment_status == "COMPLETED":
            raise ConflictException("Ushbu auksion uchun to'lov to'liq amalga oshirilgan")

        # Calculate remaining balance: winning_bid - deposit_amount
        remaining_balance = auction.result.winning_bid - auction.deposit_amount

        # Settle payment
        auction.result.payment_status = "COMPLETED"

        # Transfer funds in Double-Entry Ledger: from PLATFORM_ESCROW to PLATFORM_REVENUE & SELLER_SETTLEMENT
        await self.ledger_service.record_transfer(
            transaction_id=uuid.uuid4(),
            from_account_type="USER_WALLET",
            to_account_type="PLATFORM_ESCROW",
            amount_tiyin=remaining_balance,
            description=f"Winner settled balance for auction {auction.id}",
            from_user_id=user_id,
        )

        await self.db.commit()
        return {
            "message": "To'lov muvaffaqiyatli yakunlandi",
            "settled_amount": remaining_balance,
            "formatted_settled_amount": format_uzs(remaining_balance),
            "status": "COMPLETED",
        }

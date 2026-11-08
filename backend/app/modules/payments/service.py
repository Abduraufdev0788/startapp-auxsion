import json
import re
import uuid
from typing import Any, Dict, List
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import DepositStatus, PaymentStatus, PaymentType
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
    UnauthorizedException,
)
from app.integrations.payments.factory import get_payment_provider
from app.modules.auctions.repository import AuctionRepository
from app.modules.deposits.models import DepositModel
from app.modules.deposits.repository import DepositRepository
from app.modules.escrow.models import FinancialAccountModel, LedgerEntryModel
from app.modules.escrow.service import LedgerService
from app.modules.notifications.repository import NotificationRepository
from app.modules.payments.models import PaymentTransactionModel
from app.modules.payments.repository import PaymentRepository
from app.modules.payments.schemas import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    WalletBalanceResponse,
    WalletTransactionItem,
    WinnerSettlementRequest,
    WithdrawalRequest,
    WithdrawalResponse,
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

    async def get_wallet_balance(self, user_id: uuid.UUID) -> WalletBalanceResponse:
        """Get the user's available platform wallet balance and locked deposit totals."""
        account = await self.ledger_service.repo.get_or_create_account(
            account_type="USER_WALLET", user_id=user_id
        )

        # Calculate locked deposits in ongoing auctions
        stmt = (
            select(func.coalesce(func.sum(DepositModel.amount), 0))
            .where(
                DepositModel.user_id == user_id,
                DepositModel.status.in_([DepositStatus.LOCKED.value, DepositStatus.PAID.value]),
            )
        )
        res = await self.db.execute(stmt)
        locked_tiyin = int(res.scalar_one())

        balance_tiyin = max(0, account.balance)
        return WalletBalanceResponse(
            balance_tiyin=balance_tiyin,
            balance_uzs=balance_tiyin // 100,
            formatted_balance=format_uzs(balance_tiyin),
            locked_deposits_tiyin=locked_tiyin,
            locked_deposits_uzs=locked_tiyin // 100,
            formatted_locked=format_uzs(locked_tiyin),
            currency="UZS",
        )

    async def withdraw_funds(
        self, user_id: uuid.UUID, data: WithdrawalRequest
    ) -> WithdrawalResponse:
        """Process fund withdrawal to user's bank card with row-level balance protection."""
        clean_card = re.sub(r"\D", "", data.card_number)
        if len(clean_card) != 16:
            raise BadRequestException(
                "Karta raqami 16 ta raqamdan iborat bo'lishi shart",
                error_code="INVALID_CARD_NUMBER",
            )

        amount_tiyin = uzs_to_tiyin(data.amount_uzs)
        if amount_tiyin <= 0:
            raise BadRequestException("Yechib olish summasi noldan katta bo'lishi shart")

        # Minimum withdrawal limit: 10,000 UZS
        if amount_tiyin < 1000000:
            raise BadRequestException(
                "Minimal yechib olish summasi 10 000 UZS",
                error_code="MINIMUM_WITHDRAWAL_LIMIT",
            )

        # 1. Fetch user's financial account with row-level lock
        account_stmt = (
            select(FinancialAccountModel)
            .where(
                FinancialAccountModel.account_type == "USER_WALLET",
                FinancialAccountModel.user_id == user_id,
            )
            .with_for_update()
        )
        res = await self.db.execute(account_stmt)
        account = res.scalar_one_or_none()

        current_balance = account.balance if account else 0
        if current_balance < amount_tiyin:
            raise BadRequestException(
                f"Hisobingizda mablag' yetarli emas. Joriy balansingiz: {format_uzs(current_balance)}",
                error_code="INSUFFICIENT_FUNDS",
            )

        withdrawal_id = uuid.uuid4()
        card_type = "UZCARD"
        if clean_card.startswith("8600"):
            card_type = "UZCARD"
        elif clean_card.startswith("9860"):
            card_type = "HUMO"
        elif clean_card.startswith("4"):
            card_type = "VISA"
        elif clean_card.startswith("5"):
            card_type = "MASTERCARD"

        masked_card = f"{clean_card[:4]} **** **** {clean_card[-4:]}"
        provider_payout_ref = f"PAY_{uuid.uuid4().hex[:10].upper()}"

        # 2. Record Double-Entry Transfer (Debit USER_WALLET, Credit PLATFORM_ESCROW)
        await self.ledger_service.record_transfer(
            transaction_id=withdrawal_id,
            from_account_type="USER_WALLET",
            to_account_type="PLATFORM_ESCROW",
            amount_tiyin=amount_tiyin,
            description=f"Withdrawal to {card_type} card {masked_card}",
            from_user_id=user_id,
        )

        # 3. Create Withdrawal Request Record
        withdrawal = await self.repo.create_withdrawal(
            user_id=user_id,
            amount_tiyin=amount_tiyin,
            card_number=masked_card,
            card_holder=data.card_holder,
            card_type=card_type,
            status=PaymentStatus.COMPLETED.value,
            provider_ref=provider_payout_ref,
        )

        # 4. Create Notification
        notif_repo = NotificationRepository(self.db)
        await notif_repo.create_notification(
            user_id=user_id,
            title="Pul muvaffaqiyatli yechildi",
            message=f"{format_uzs(amount_tiyin)} mablag' {masked_card} kartangizga o'tkazildi (Chek: {provider_payout_ref}).",
            type="WITHDRAWAL",
        )

        await self.db.commit()

        return WithdrawalResponse(
            id=withdrawal.id,
            amount_tiyin=withdrawal.amount,
            amount_uzs=withdrawal.amount // 100,
            formatted_amount=format_uzs(withdrawal.amount),
            card_number_masked=withdrawal.card_number,
            card_holder=withdrawal.card_holder,
            card_type=withdrawal.card_type,
            status=withdrawal.status,
            provider_ref=withdrawal.provider_ref,
            created_at=withdrawal.created_at,
        )

    async def list_withdrawals(self, user_id: uuid.UUID) -> List[WithdrawalResponse]:
        """List user withdrawal history."""
        records = await self.repo.list_withdrawals(user_id)
        return [
            WithdrawalResponse(
                id=rec.id,
                amount_tiyin=rec.amount,
                amount_uzs=rec.amount // 100,
                formatted_amount=format_uzs(rec.amount),
                card_number_masked=rec.card_number,
                card_holder=rec.card_holder,
                card_type=rec.card_type,
                status=rec.status,
                provider_ref=rec.provider_ref,
                created_at=rec.created_at,
            )
            for rec in records
        ]

    async def get_wallet_transactions(
        self, user_id: uuid.UUID
    ) -> List[WalletTransactionItem]:
        """Get unified wallet transactions history (refunds, deposits, withdrawals)."""
        account = await self.ledger_service.repo.get_or_create_account(
            account_type="USER_WALLET", user_id=user_id
        )

        stmt = (
            select(LedgerEntryModel)
            .where(LedgerEntryModel.account_id == account.id)
            .order_by(LedgerEntryModel.created_at.desc())
            .limit(50)
        )
        res = await self.db.execute(stmt)
        entries = res.scalars().all()

        items: List[WalletTransactionItem] = []
        for entry in entries:
            is_credit = entry.credit_amount > 0
            amount_tiyin = entry.credit_amount if is_credit else entry.debit_amount
            tx_type = "DEPOSIT_REFUND" if is_credit else "WITHDRAWAL"
            if "participation deposit" in entry.description.lower() or "refund" in entry.description.lower():
                tx_type = "DEPOSIT_REFUND"
            elif "withdrawal" in entry.description.lower():
                tx_type = "WITHDRAWAL"
            elif "deposit" in entry.description.lower():
                tx_type = "DEPOSIT_PAYMENT"

            items.append(
                WalletTransactionItem(
                    id=entry.id,
                    type=tx_type,
                    amount_tiyin=amount_tiyin,
                    amount_uzs=amount_tiyin // 100,
                    formatted_amount=format_uzs(amount_tiyin),
                    description=entry.description.replace("[CREDIT] ", "").replace("[DEBIT] ", ""),
                    created_at=entry.created_at,
                    status="COMPLETED",
                    is_credit=is_credit,
                )
            )
        return items

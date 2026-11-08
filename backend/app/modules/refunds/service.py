import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import DepositStatus, RefundStatus
from app.core.exceptions import ConflictException, NotFoundException
from app.integrations.payments.factory import get_payment_provider
from app.modules.deposits.repository import DepositRepository
from app.modules.escrow.service import LedgerService
from app.modules.refunds.models import RefundModel
from app.modules.refunds.repository import RefundRepository


class RefundService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = RefundRepository(db)
        self.deposit_repo = DepositRepository(db)
        self.ledger_service = LedgerService(db)
        self.payment_provider = get_payment_provider()

    async def process_refund(
        self,
        deposit_id: uuid.UUID,
        idempotency_key: str,
        reason: str = "Auksion yakunlandi, kafolat depozitini qaytarish",
    ) -> RefundModel:
        """Idempotent deposit refund execution with double-entry ledger bookkeeping."""
        # 1. Idempotency Check: Prevent duplicate refund requests
        existing = await self.repo.get_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        already_refunded = await self.repo.get_by_deposit_id(deposit_id)
        if already_refunded:
            return already_refunded

        deposit = await self.db.get(DepositRepository, deposit_id) if False else None
        # Retrieve deposit directly using session
        from app.modules.deposits.models import DepositModel
        deposit = await self.db.get(DepositModel, deposit_id)
        if not deposit:
            raise NotFoundException("Depozit topilmadi", error_code="DEPOSIT_NOT_FOUND")

        if deposit.status == DepositStatus.REFUNDED.value:
            raise ConflictException("Ushbu depozit allaqachon qaytarilgan", error_code="ALREADY_REFUNDED")

        # 2. Update status to REFUND_PENDING
        await self.deposit_repo.update_status(deposit, DepositStatus.REFUND_PENDING.value)

        # 3. Call payment provider refund API
        provider_res = await self.payment_provider.refund(
            provider_transaction_id=deposit.provider_ref or f"txn_{deposit.id}",
            amount_tiyin=deposit.amount,
            reason=reason,
        )

        # 4. Mark deposit REFUNDED only after provider confirmation
        await self.deposit_repo.update_status(deposit, DepositStatus.REFUNDED.value)

        # 5. Persist Refund Record
        refund = await self.repo.create_refund(
            deposit_id=deposit.id,
            user_id=deposit.user_id,
            amount=deposit.amount,
            idempotency_key=idempotency_key,
            status=RefundStatus.COMPLETED.value,
            provider_refund_id=provider_res.provider_refund_id,
        )

        # 6. Record in Double-Entry Financial Ledger: Funds move from PLATFORM_ESCROW -> USER_WALLET
        await self.ledger_service.record_transfer(
            transaction_id=refund.id,
            from_account_type="PLATFORM_ESCROW",
            to_account_type="USER_WALLET",
            amount_tiyin=deposit.amount,
            description=f"Refund deposit for auction {deposit.auction_id}",
            to_user_id=deposit.user_id,
        )

        # 7. Create in-app notification for the user
        from app.modules.notifications.repository import NotificationRepository
        from app.utils.money import format_uzs
        notif_repo = NotificationRepository(self.db)
        await notif_repo.create_notification(
            user_id=deposit.user_id,
            title="Kafolat depoziti hisobingizga qaytarildi",
            message=f"Auksion yakunlandi. {format_uzs(deposit.amount)} kafolat depoziti sizning shaxsiy balansingizga qaytarildi. Istalgan vaqtda kartangizga yechib olishingiz mumkin.",
            type="DEPOSIT_REFUND",
        )

        await self.db.commit()
        return refund

    async def process_auction_refunds(
        self, auction_id: uuid.UUID, winner_id: Optional[uuid.UUID] = None
    ) -> List[RefundModel]:
        """Automatically refund participation deposits to internal balance for non-winning participants."""
        from sqlalchemy import select
        from app.modules.deposits.models import DepositModel

        stmt = (
            select(DepositModel)
            .where(
                DepositModel.auction_id == auction_id,
                DepositModel.status.in_([DepositStatus.LOCKED.value, DepositStatus.PAID.value]),
            )
        )
        if winner_id:
            stmt = stmt.where(DepositModel.user_id != winner_id)

        res = await self.db.execute(stmt)
        deposits = res.scalars().all()

        refunds = []
        for dep in deposits:
            idem_key = f"refund_auc_{auction_id}_{dep.id}"
            ref = await self.process_refund(
                deposit_id=dep.id,
                idempotency_key=idem_key,
                reason="Auksion yakunlandi, kafolat depoziti hisobga qaytarildi",
            )
            refunds.append(ref)
        return refunds

    async def list_my_refunds(self, user_id: uuid.UUID) -> List[RefundModel]:
        return await self.repo.list_by_user(user_id)

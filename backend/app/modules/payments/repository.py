import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import Currency, PaymentStatus, PaymentType
from app.modules.payments.models import (
    PaymentTransactionModel,
    PaymentWebhookEventModel,
    WithdrawalRequestModel,
)


class PaymentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transaction(
        self,
        user_id: uuid.UUID,
        transaction_type: str,
        amount_tiyin: int,
        provider: str,
        idempotency_key: str,
        status: str = PaymentStatus.PENDING.value,
    ) -> PaymentTransactionModel:
        txn = PaymentTransactionModel(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=amount_tiyin,
            currency=Currency.UZS.value,
            status=status,
            provider=provider,
            idempotency_key=idempotency_key,
        )
        self.db.add(txn)
        await self.db.flush()
        return txn

    async def get_by_id(self, txn_id: uuid.UUID) -> Optional[PaymentTransactionModel]:
        stmt = select(PaymentTransactionModel).where(PaymentTransactionModel.id == txn_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_provider_transaction_id(
        self, provider_transaction_id: str
    ) -> Optional[PaymentTransactionModel]:
        stmt = select(PaymentTransactionModel).where(
            PaymentTransactionModel.provider_transaction_id == provider_transaction_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(
        self,
        txn: PaymentTransactionModel,
        status: str,
        provider_transaction_id: Optional[str] = None,
    ) -> None:
        txn.status = status
        if provider_transaction_id:
            txn.provider_transaction_id = provider_transaction_id
        await self.db.flush()

    async def record_webhook_event(
        self, provider: str, event_id: str, payload: str, status: str = "PROCESSED"
    ) -> PaymentWebhookEventModel:
        event = PaymentWebhookEventModel(
            provider=provider,
            event_id=event_id,
            payload=payload,
            status=status,
        )
        self.db.add(event)
        await self.db.flush()
        return event

    async def get_webhook_event(self, event_id: str) -> Optional[PaymentWebhookEventModel]:
        stmt = select(PaymentWebhookEventModel).where(
            PaymentWebhookEventModel.event_id == event_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_withdrawal(
        self,
        user_id: uuid.UUID,
        amount_tiyin: int,
        card_number: str,
        card_holder: Optional[str],
        card_type: str,
        status: str = PaymentStatus.COMPLETED.value,
        provider_ref: Optional[str] = None,
    ) -> WithdrawalRequestModel:
        withdrawal = WithdrawalRequestModel(
            user_id=user_id,
            amount=amount_tiyin,
            currency=Currency.UZS.value,
            card_number=card_number,
            card_holder=card_holder,
            card_type=card_type,
            status=status,
            provider_ref=provider_ref,
        )
        self.db.add(withdrawal)
        await self.db.flush()
        return withdrawal

    async def list_withdrawals(self, user_id: uuid.UUID) -> List[WithdrawalRequestModel]:
        stmt = (
            select(WithdrawalRequestModel)
            .where(WithdrawalRequestModel.user_id == user_id)
            .order_by(WithdrawalRequestModel.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import Currency, PaymentStatus, PaymentType
from app.modules.payments.models import (
    PaymentTransactionModel,
    PaymentWebhookEventModel,
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

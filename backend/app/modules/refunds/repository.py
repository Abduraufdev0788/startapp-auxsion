import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import RefundStatus
from app.modules.refunds.models import RefundModel


class RefundRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, refund_id: uuid.UUID) -> Optional[RefundModel]:
        stmt = select(RefundModel).where(RefundModel.id == refund_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_idempotency_key(self, idempotency_key: str) -> Optional[RefundModel]:
        stmt = select(RefundModel).where(RefundModel.idempotency_key == idempotency_key)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_deposit_id(self, deposit_id: uuid.UUID) -> Optional[RefundModel]:
        stmt = select(RefundModel).where(RefundModel.deposit_id == deposit_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_refund(
        self,
        deposit_id: uuid.UUID,
        user_id: uuid.UUID,
        amount: int,
        idempotency_key: str,
        status: str = RefundStatus.REQUESTED.value,
        provider_refund_id: Optional[str] = None,
    ) -> RefundModel:
        refund = RefundModel(
            deposit_id=deposit_id,
            user_id=user_id,
            amount=amount,
            idempotency_key=idempotency_key,
            status=status,
            provider_refund_id=provider_refund_id,
        )
        self.db.add(refund)
        await self.db.flush()
        return refund

    async def list_by_user(self, user_id: uuid.UUID) -> List[RefundModel]:
        stmt = (
            select(RefundModel)
            .where(RefundModel.user_id == user_id)
            .order_by(RefundModel.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

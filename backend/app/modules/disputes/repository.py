import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import DisputeStatus
from app.modules.disputes.models import DisputeModel


class DisputeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_dispute(
        self,
        auction_id: uuid.UUID,
        raised_by_id: uuid.UUID,
        reason: str,
        description: str,
    ) -> DisputeModel:
        dispute = DisputeModel(
            auction_id=auction_id,
            raised_by_id=raised_by_id,
            reason=reason,
            description=description,
            status=DisputeStatus.OPEN.value,
        )
        self.db.add(dispute)
        await self.db.flush()
        return dispute

    async def get_by_id(self, dispute_id: uuid.UUID) -> Optional[DisputeModel]:
        stmt = select(DisputeModel).where(DisputeModel.id == dispute_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(
        self, status: Optional[str] = None, limit: int = 50, offset: int = 0
    ) -> List[DisputeModel]:
        stmt = select(DisputeModel)
        if status:
            stmt = stmt.where(DisputeModel.status == status)
        stmt = stmt.order_by(DisputeModel.created_at.desc()).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def list_by_user(self, user_id: uuid.UUID) -> List[DisputeModel]:
        stmt = (
            select(DisputeModel)
            .where(DisputeModel.raised_by_id == user_id)
            .order_by(DisputeModel.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def resolve(
        self, dispute: DisputeModel, resolution: str, notes: str
    ) -> DisputeModel:
        dispute.status = resolution
        dispute.resolution_notes = notes
        await self.db.flush()
        return dispute

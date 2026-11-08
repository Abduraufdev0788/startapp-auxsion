import uuid
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import ParticipantStatus
from app.modules.participants.models import AuctionParticipantModel


class ParticipantRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_participant(
        self, auction_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[AuctionParticipantModel]:
        stmt = select(AuctionParticipantModel).where(
            AuctionParticipantModel.auction_id == auction_id,
            AuctionParticipantModel.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_participant(
        self,
        auction_id: uuid.UUID,
        user_id: uuid.UUID,
        deposit_id: uuid.UUID,
        status: str = ParticipantStatus.ELIGIBLE.value,
    ) -> AuctionParticipantModel:
        participant = AuctionParticipantModel(
            auction_id=auction_id,
            user_id=user_id,
            deposit_id=deposit_id,
            status=status,
        )
        self.db.add(participant)
        await self.db.flush()
        return participant

    async def list_by_auction(self, auction_id: uuid.UUID) -> List[AuctionParticipantModel]:
        stmt = select(AuctionParticipantModel).where(
            AuctionParticipantModel.auction_id == auction_id
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_by_auction(self, auction_id: uuid.UUID) -> int:
        stmt = select(func.count(AuctionParticipantModel.id)).where(
            AuctionParticipantModel.auction_id == auction_id
        )
        result = await self.db.execute(stmt)
        return result.scalar() or 0

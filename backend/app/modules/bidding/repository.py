import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.bidding.models import BidModel


class BiddingRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_bid(
        self, auction_id: uuid.UUID, user_id: uuid.UUID, amount: int
    ) -> BidModel:
        bid = BidModel(
            auction_id=auction_id,
            user_id=user_id,
            amount=amount,
        )
        self.db.add(bid)
        await self.db.flush()
        return bid

    async def list_bids(
        self, auction_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> List[BidModel]:
        stmt = (
            select(BidModel)
            .where(BidModel.auction_id == auction_id)
            .order_by(BidModel.amount.desc(), BidModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_highest_bid(self, auction_id: uuid.UUID) -> Optional[BidModel]:
        stmt = (
            select(BidModel)
            .where(BidModel.auction_id == auction_id)
            .order_by(BidModel.amount.desc())
            .limit(1)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_user_bids(
        self, auction_id: uuid.UUID, user_id: uuid.UUID
    ) -> List[BidModel]:
        stmt = (
            select(BidModel)
            .where(
                BidModel.auction_id == auction_id,
                BidModel.user_id == user_id,
            )
            .order_by(BidModel.created_at.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

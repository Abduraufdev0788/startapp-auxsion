import uuid
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.favorites.models import FavoriteModel
from app.modules.auctions.models import AuctionModel
from app.modules.products.models import ProductModel


class FavoriteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_and_auction(
        self, user_id: uuid.UUID, auction_id: uuid.UUID
    ) -> Optional[FavoriteModel]:
        stmt = select(FavoriteModel).where(
            FavoriteModel.user_id == user_id,
            FavoriteModel.auction_id == auction_id,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def add(self, user_id: uuid.UUID, auction_id: uuid.UUID) -> FavoriteModel:
        fav = FavoriteModel(user_id=user_id, auction_id=auction_id)
        self.db.add(fav)
        await self.db.flush()
        return fav

    async def remove(self, user_id: uuid.UUID, auction_id: uuid.UUID) -> bool:
        stmt = delete(FavoriteModel).where(
            FavoriteModel.user_id == user_id,
            FavoriteModel.auction_id == auction_id,
        )
        res = await self.db.execute(stmt)
        await self.db.flush()
        return res.rowcount > 0  # type: ignore

    async def list_by_user(self, user_id: uuid.UUID) -> List[AuctionModel]:
        stmt = (
            select(AuctionModel)
            .join(FavoriteModel, FavoriteModel.auction_id == AuctionModel.id)
            .options(
                selectinload(AuctionModel.product).selectinload(ProductModel.images)
            )
            .where(FavoriteModel.user_id == user_id)
            .order_by(FavoriteModel.created_at.desc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_user_favorite_auction_ids(self, user_id: uuid.UUID) -> List[uuid.UUID]:
        stmt = select(FavoriteModel.auction_id).where(FavoriteModel.user_id == user_id)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.favorites.repository import FavoriteRepository
from app.modules.favorites.models import FavoriteModel
from app.modules.auctions.models import AuctionModel
from app.modules.auctions.repository import AuctionRepository
from app.core.exceptions import NotFoundException


class FavoriteService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = FavoriteRepository(db)
        self.auction_repo = AuctionRepository(db)

    async def toggle_favorite(self, user_id: uuid.UUID, auction_id: uuid.UUID) -> bool:
        """
        Toggles an auction in user's favorites.
        Returns True if added, False if removed.
        """
        auction = await self.auction_repo.get_by_id(auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi")

        existing = await self.repository.get_by_user_and_auction(user_id, auction_id)
        if existing:
            await self.repository.remove(user_id, auction_id)
            await self.db.commit()
            return False
        else:
            await self.repository.add(user_id, auction_id)
            await self.db.commit()
            return True

    async def is_favorite(self, user_id: uuid.UUID, auction_id: uuid.UUID) -> bool:
        fav = await self.repository.get_by_user_and_auction(user_id, auction_id)
        return fav is not None

    async def list_favorites(self, user_id: uuid.UUID) -> List[AuctionModel]:
        return await self.repository.list_by_user(user_id)

    async def get_favorite_auction_ids(self, user_id: uuid.UUID) -> List[str]:
        ids = await self.repository.get_user_favorite_auction_ids(user_id)
        return [str(i) for i in ids]

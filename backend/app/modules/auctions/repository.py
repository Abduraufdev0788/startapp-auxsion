import uuid
from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.auctions.models import AuctionEventModel, AuctionModel
from app.modules.products.models import ProductImageModel, ProductModel
from app.utils.money import uzs_to_tiyin
from app.core.constants import AuctionStatus
from app.modules.auctions.schemas import AuctionCreateRequest


class AuctionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(
        self, auction_id: uuid.UUID, for_update: bool = False
    ) -> Optional[AuctionModel]:
        stmt = (
            select(AuctionModel)
            .options(
                selectinload(AuctionModel.product).selectinload(ProductModel.images),
                selectinload(AuctionModel.result),
            )
            .where(AuctionModel.id == auction_id)
        )
        if for_update:
            stmt = stmt.with_for_update()

        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_marketplace(
        self,
        category_id: Optional[uuid.UUID] = None,
        status: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Tuple[List[AuctionModel], int]:
        query = (
            select(AuctionModel)
            .join(ProductModel, AuctionModel.product_id == ProductModel.id)
            .options(
                selectinload(AuctionModel.product).selectinload(ProductModel.images)
            )
        )
        count_query = select(func.count(AuctionModel.id)).join(
            ProductModel, AuctionModel.product_id == ProductModel.id
        )

        if category_id:
            query = query.where(ProductModel.category_id == category_id)
            count_query = count_query.where(ProductModel.category_id == category_id)

        if status:
            query = query.where(AuctionModel.status == status)
            count_query = count_query.where(AuctionModel.status == status)

        if search:
            search_filter = ProductModel.title.ilike(f"%{search}%")
            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        # Sort ending soonest first by default
        query = query.order_by(AuctionModel.end_time.asc()).offset(offset).limit(limit)

        result = await self.db.execute(query)
        items = list(result.scalars().all())
        return items, total

    async def create(self, seller_id: uuid.UUID, data: AuctionCreateRequest) -> AuctionModel:
        auction = AuctionModel(
            seller_id=seller_id,
            product_id=data.product_id,
            # Convert sums to tiyin (BigInteger)
            starting_price=uzs_to_tiyin(data.starting_price_uzs),
            reserve_price=uzs_to_tiyin(data.reserve_price_uzs),
            min_bid_increment=uzs_to_tiyin(data.min_bid_increment_uzs),
            deposit_amount=uzs_to_tiyin(data.deposit_amount_uzs),
            current_highest_bid=uzs_to_tiyin(data.starting_price_uzs),
            start_time=data.start_time,
            end_time=data.end_time,
            status=AuctionStatus.DRAFT.value,
            delivery_info=data.delivery_info,
            rules=data.rules,
        )
        self.db.add(auction)
        await self.db.flush()
        return await self.get_by_id(auction.id)  # type: ignore

    async def update_status(self, auction: AuctionModel, new_status: str) -> None:
        auction.status = new_status
        await self.db.flush()

    async def record_event(self, auction_id: uuid.UUID, event_type: str, payload: str) -> None:
        event = AuctionEventModel(
            auction_id=auction_id,
            event_type=event_type,
            payload=payload,
        )
        self.db.add(event)
        await self.db.flush()

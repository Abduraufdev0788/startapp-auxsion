import uuid
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import AuctionStatus
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.modules.auctions.models import AuctionModel
from app.modules.auctions.repository import AuctionRepository
from app.modules.auctions.schemas import AuctionCreateRequest, AuctionResponse
from app.modules.products.repository import ProductRepository
from app.utils.pagination import PaginatedResponse, PaginationParams


class AuctionService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AuctionRepository(db)
        self.product_repo = ProductRepository(db)

    async def get_auction(self, auction_id: uuid.UUID) -> AuctionModel:
        auction = await self.repo.get_by_id(auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")
        return auction

    async def list_marketplace(
        self,
        category_id: Optional[uuid.UUID],
        status: Optional[str],
        search: Optional[str],
        params: PaginationParams,
    ) -> PaginatedResponse[AuctionResponse]:
        # Default to ACTIVE auctions for public marketplace if status not specified
        query_status = status or AuctionStatus.ACTIVE.value
        items, total = await self.repo.list_marketplace(
            category_id=category_id,
            status=query_status,
            search=search,
            limit=params.limit,
            offset=params.offset,
        )
        schema_items = [AuctionResponse.model_validate(item) for item in items]
        return PaginatedResponse.create(items=schema_items, total=total, params=params)

    async def create_auction(
        self, seller_id: uuid.UUID, data: AuctionCreateRequest
    ) -> AuctionModel:
        product = await self.product_repo.get_by_id(data.product_id)
        if not product:
            raise NotFoundException("Mahsulot topilmadi", error_code="PRODUCT_NOT_FOUND")

        if product.seller_id != seller_id:
            raise ForbiddenException(
                "Siz faqat o'zingizga tegishli mahsulotni auksionga qo'ya olasiz",
                error_code="NOT_PRODUCT_OWNER",
            )

        # Auction duration validation (between 1 hour and 30 days)
        duration = data.end_time - data.start_time
        min_duration = timedelta(hours=settings.MIN_AUCTION_DURATION_HOURS)
        max_duration = timedelta(days=settings.MAX_AUCTION_DURATION_DAYS)

        if duration < min_duration:
            raise BadRequestException(
                f"Auksion davomiyligi kamida {settings.MIN_AUCTION_DURATION_HOURS} soat bo'lishi shart",
                error_code="AUCTION_TOO_SHORT",
            )
        if duration > max_duration:
            raise BadRequestException(
                f"Auksion davomiyligi ko'pi bilan {settings.MAX_AUCTION_DURATION_DAYS} kun bo'lishi mumkin",
                error_code="AUCTION_TOO_LONG",
            )

        auction = await self.repo.create(seller_id, data)
        await self.repo.record_event(
            auction_id=auction.id,
            event_type="auction.created",
            payload=f"Auction created in DRAFT status by seller {seller_id}",
        )
        await self.db.commit()
        return auction

    async def publish_auction(self, auction_id: uuid.UUID, user_id: uuid.UUID) -> AuctionModel:
        auction = await self.get_auction(auction_id)
        if auction.seller_id != user_id:
            raise ForbiddenException("Faqat auksion egasi uni e'lon qila oladi", error_code="NOT_SELLER")

        if auction.status != AuctionStatus.DRAFT.value:
            raise ConflictException("Faqat qoralama (DRAFT) auksion e'lon qilinishi mumkin", error_code="NOT_DRAFT")

        now = datetime.now(timezone.utc)
        start_time = auction.start_time
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=timezone.utc)

        # Determine whether to schedule or activate immediately
        new_status = AuctionStatus.ACTIVE.value if start_time <= now else AuctionStatus.SCHEDULED.value

        await self.repo.update_status(auction, new_status)
        await self.repo.record_event(
            auction_id=auction.id,
            event_type="auction.published",
            payload=f"Auction published. Status changed to {new_status}",
        )
        await self.db.commit()
        return auction

    async def cancel_auction(
        self, auction_id: uuid.UUID, user_id: uuid.UUID, reason: str
    ) -> AuctionModel:
        auction = await self.get_auction(auction_id)
        if auction.seller_id != user_id:
            raise ForbiddenException("Auksionni bekor qilishga ruxsat yo'q", error_code="NOT_AUTHORIZED")

        # If bids have already been placed, seller cannot cancel freely
        if auction.bid_count > 0:
            raise ConflictException(
                "Takliflar berilgan auksionni mustaqil bekor qilib bo'lmaydi. Ma'muriyatga murojaat qiling",
                error_code="AUCTION_HAS_BIDS",
            )

        await self.repo.update_status(auction, AuctionStatus.CANCELLED.value)
        await self.repo.record_event(
            auction_id=auction.id,
            event_type="auction.cancelled",
            payload=f"Auction cancelled by seller. Reason: {reason}",
        )
        await self.db.commit()
        return auction

    async def list_my_created(self, seller_id: uuid.UUID) -> List[AuctionResponse]:
        items = await self.repo.list_by_seller(seller_id)
        return [AuctionResponse.model_validate(item) for item in items]

    async def list_my_participating(self, user_id: uuid.UUID) -> List[AuctionResponse]:
        items = await self.repo.list_by_participant(user_id)
        return [AuctionResponse.model_validate(item) for item in items]

    async def list_my_won(self, user_id: uuid.UUID) -> List[AuctionResponse]:
        items = await self.repo.list_won_by_user(user_id)
        return [AuctionResponse.model_validate(item) for item in items]

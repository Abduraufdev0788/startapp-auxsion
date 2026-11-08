import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auctions.schemas import AuctionCreateRequest, AuctionResponse
from app.modules.auctions.service import AuctionService
from app.modules.users.models import UserModel
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(prefix="/auctions", tags=["Auctions"])


@router.post(
    "",
    response_model=AuctionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi auksion yaratish (Qoralama holatda)",
)
async def create_auction(
    data: AuctionCreateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.create_auction(current_user.id, data)


@router.get(
    "",
    response_model=PaginatedResponse[AuctionResponse],
    status_code=status.HTTP_200_OK,
    summary="Bozordagi faol auksionlar ro'yxatini olish (Sahifalash va filter)",
)
async def list_auctions(
    category_id: Optional[uuid.UUID] = Query(None, description="Toifa bo'yicha filter"),
    status: Optional[str] = Query(None, description="Auksion holati bo'yicha filter (ACTIVE, SCHEDULED)"),
    search: Optional[str] = Query(None, description="Qidiruv so'zi"),
    page: int = Query(1, ge=1, description="Sahifa"),
    page_size: int = Query(20, ge=1, le=100, description="Hajm"),
    db: AsyncSession = Depends(get_db),
):
    params = PaginationParams(page=page, page_size=page_size)
    service = AuctionService(db)
    return await service.list_marketplace(category_id, status, search, params)


@router.get(
    "/my/created",
    response_model=List[AuctionResponse],
    status_code=status.HTTP_200_OK,
    summary="Mening sotuvga qo'ygan auksionlarim ro'yxati",
)
async def list_my_created_auctions(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.list_my_created(current_user.id)


@router.get(
    "/my/participating",
    response_model=List[AuctionResponse],
    status_code=status.HTTP_200_OK,
    summary="Men ishtirok etayotgan auksionlar ro'yxati",
)
async def list_my_participating_auctions(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.list_my_participating(current_user.id)


@router.get(
    "/my/won",
    response_model=List[AuctionResponse],
    status_code=status.HTTP_200_OK,
    summary="Men yutib olgan auksionlar ro'yxati",
)
async def list_my_won_auctions(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.list_my_won(current_user.id)


@router.get(
    "/{auction_id}",
    response_model=AuctionResponse,
    status_code=status.HTTP_200_OK,
    summary="Auksion tafsilotlarini olish",
)
async def get_auction(
    auction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.get_auction(auction_id)


@router.post(
    "/{auction_id}/publish",
    response_model=AuctionResponse,
    status_code=status.HTTP_200_OK,
    summary="Auksionni ommaga e'lon qilish",
)
async def publish_auction(
    auction_id: uuid.UUID,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.publish_auction(auction_id, current_user.id)


@router.post(
    "/{auction_id}/cancel",
    response_model=AuctionResponse,
    status_code=status.HTTP_200_OK,
    summary="Auksionni bekor qilish",
)
async def cancel_auction(
    auction_id: uuid.UUID,
    reason: str = Query("Sotuvchi tomonidan bekor qilindi"),
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = AuctionService(db)
    return await service.cancel_auction(auction_id, current_user.id, reason)

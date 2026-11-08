import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import UserModel
from app.modules.favorites.service import FavoriteService
from app.modules.favorites.schemas import FavoriteStatusResponse
from app.modules.auctions.schemas import AuctionResponse

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.post(
    "/{auction_id}/toggle",
    response_model=FavoriteStatusResponse,
    summary="Auksionni sevimlilarga qo'shish yoki olib tashlash",
)
async def toggle_favorite(
    auction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    service = FavoriteService(db)
    is_fav = await service.toggle_favorite(current_user.id, auction_id)
    return FavoriteStatusResponse(auction_id=auction_id, is_favorite=is_fav)


@router.get(
    "/{auction_id}/status",
    response_model=FavoriteStatusResponse,
    summary="Auksion sevimlilarda bor-yo'qligini tekshirish",
)
async def get_favorite_status(
    auction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    service = FavoriteService(db)
    is_fav = await service.is_favorite(current_user.id, auction_id)
    return FavoriteStatusResponse(auction_id=auction_id, is_favorite=is_fav)


@router.get(
    "",
    response_model=List[AuctionResponse],
    summary="Foydalanuvchining barcha sevimli auksionlari",
)
async def list_user_favorites(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    service = FavoriteService(db)
    auctions = await service.list_favorites(current_user.id)
    return auctions


@router.get(
    "/ids",
    response_model=List[str],
    summary="Foydalanuvchining sevimli auksionlari ID ro'yxati",
)
async def get_favorite_ids(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    service = FavoriteService(db)
    return await service.get_favorite_auction_ids(current_user.id)


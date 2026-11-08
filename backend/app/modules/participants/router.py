import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.participants.schemas import (
    ParticipantResponse,
    ParticipationStatusResponse,
)
from app.modules.participants.service import ParticipantService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/auctions/{auction_id}", tags=["Auction Participation"])


@router.post(
    "/participate",
    response_model=ParticipantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Auksionda depozit to'lab ishtirokchi sifatida ro'yxatdan o'tish",
)
async def participate_in_auction(
    auction_id: uuid.UUID,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = ParticipantService(db)
    return await service.participate(auction_id, current_user.id)


@router.get(
    "/participation",
    response_model=ParticipationStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Foydalanuvchining ushbu auksiondagi ishtirok va depozit holatini tekshirish",
)
async def get_participation_status(
    auction_id: uuid.UUID,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = ParticipantService(db)
    return await service.get_participation_status(auction_id, current_user.id)

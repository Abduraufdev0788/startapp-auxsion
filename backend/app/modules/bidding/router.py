import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.bidding.schemas import BidCreateRequest, BidResponse
from app.modules.bidding.service import BiddingService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/auctions/{auction_id}/bids", tags=["Bidding"])


@router.post(
    "",
    response_model=BidResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Auksionga narx taklifini yuborish (Concurrent safe)",
)
async def submit_bid(
    auction_id: uuid.UUID,
    data: BidCreateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = BiddingService(db)
    return await service.submit_bid(auction_id, current_user.id, data)


@router.get(
    "",
    response_model=List[BidResponse],
    status_code=status.HTTP_200_OK,
    summary="Auksionning barcha takliflar tarixini olish",
)
async def list_auction_bids(
    auction_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = BiddingService(db)
    return await service.list_bids(auction_id, limit, offset)

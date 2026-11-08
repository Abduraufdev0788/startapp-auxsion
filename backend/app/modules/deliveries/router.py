import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.deliveries.schemas import (
    CreateDeliveryAddressRequest,
    DeliveryResponse,
    UpdateShippingTrackingRequest,
)
from app.modules.deliveries.service import DeliveryService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/deliveries", tags=["Deliveries"])


@router.post(
    "/auctions/{auction_id}",
    response_model=DeliveryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yutib olingan auksion uchun yetkazib berish manzilini kiritish",
)
async def submit_delivery_address(
    auction_id: uuid.UUID,
    data: CreateDeliveryAddressRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.submit_delivery_address(auction_id, current_user.id, data)


@router.patch(
    "/{delivery_id}/ship",
    response_model=DeliveryResponse,
    status_code=status.HTTP_200_OK,
    summary="Sotuvchi tomonidan kuzatuv raqami (tracking number) kiritish",
)
async def ship_order(
    delivery_id: uuid.UUID,
    data: UpdateShippingTrackingRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.ship_order(delivery_id, current_user.id, data)


@router.post(
    "/{delivery_id}/confirm",
    response_model=DeliveryResponse,
    status_code=status.HTTP_200_OK,
    summary="Xaridor mahsulotni qabul qilib olganini tasdiqlashi (Escrow ozod qilinadi)",
)
async def confirm_delivery_receipt(
    delivery_id: uuid.UUID,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.confirm_delivery_receipt(delivery_id, current_user.id)


@router.get(
    "/my",
    response_model=List[DeliveryResponse],
    status_code=status.HTTP_200_OK,
    summary="Mening barcha jo'natmalarim va yetkazib berishlarim",
)
async def list_my_deliveries(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = DeliveryService(db)
    return await service.list_my_deliveries(current_user.id)

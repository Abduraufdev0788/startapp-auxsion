import uuid
from fastapi import APIRouter, Depends, Header, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.payments.schemas import (
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    WinnerSettlementRequest,
)
from app.modules.payments.service import PaymentService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post(
    "/initiate",
    response_model=PaymentInitiateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="To'lov sessiyasini boshlash va checkout URL olish",
)
async def initiate_payment(
    data: PaymentInitiateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.initiate_payment(current_user.id, data)


@router.post(
    "/webhooks/{provider}",
    status_code=status.HTTP_200_OK,
    summary="To'lov provayderi webhook hodisasini qabul qilish",
)
async def payment_webhook(
    provider: str,
    request: Request,
    x_signature: str = Header("", alias="X-Signature"),
    db: AsyncSession = Depends(get_db),
):
    body_bytes = await request.body()
    service = PaymentService(db)
    return await service.process_webhook(
        provider_name=provider,
        payload_bytes=body_bytes,
        signature_header=x_signature,
    )


@router.post(
    "/winner-settle",
    status_code=status.HTTP_200_OK,
    summary="G'olib tomonidan qolgan yakuniy balansni to'lash",
)
async def settle_winner_payment(
    data: WinnerSettlementRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = PaymentService(db)
    return await service.settle_winner_payment(current_user.id, data)

import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.disputes.schemas import DisputeCreateRequest, DisputeResponse
from app.modules.disputes.service import DisputeService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/disputes", tags=["Disputes"])


@router.post(
    "",
    response_model=DisputeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Auksion bo'yicha e'tiroz yoki nizo (shikoyat) ochish",
)
async def create_dispute(
    data: DisputeCreateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = DisputeService(db)
    return await service.create_dispute(current_user.id, data)


@router.get(
    "/my",
    response_model=List[DisputeResponse],
    status_code=status.HTTP_200_OK,
    summary="Mening barcha nizolarim ro'yxati",
)
async def list_my_disputes(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = DisputeService(db)
    return await service.list_my_disputes(current_user.id)

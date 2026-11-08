import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.refunds.schemas import RefundResponse
from app.modules.refunds.service import RefundService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/refunds", tags=["Refunds"])


@router.get(
    "/my",
    response_model=List[RefundResponse],
    status_code=status.HTTP_200_OK,
    summary="Mening qaytarilgan depozitlarim ro'yxatini olish",
)
async def list_my_refunds(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = RefundService(db)
    return await service.list_my_refunds(current_user.id)

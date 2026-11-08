import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.deposits.models import DepositModel
from app.modules.users.models import UserModel

router = APIRouter(prefix="/deposits", tags=["Deposits"])


class DepositResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    amount: int
    currency: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.get(
    "/my",
    response_model=List[DepositResponse],
    status_code=status.HTTP_200_OK,
    summary="Mening barcha auksion depozitlarim ro'yxati",
)
async def list_my_deposits(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(DepositModel)
        .where(DepositModel.user_id == current_user.id)
        .order_by(DepositModel.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())

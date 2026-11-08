import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.users.models import UserModel
from app.modules.users.schemas import (
    UpdateUserProfileRequest,
    UserProfileResponse,
    UserResponse,
)
from app.modules.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Joriy foydalanuvchi profilini olish",
)
async def get_my_profile(
    current_user: UserModel = Depends(get_current_active_user),
):
    return UserResponse(
        id=current_user.id,
        phone=current_user.phone,
        email=current_user.email,  # type: ignore
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        profile=UserProfileResponse.model_validate(current_user.profile) if current_user.profile else None,
        roles=[r.name for r in current_user.roles] if current_user.roles else [],
    )


@router.patch(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Joriy foydalanuvchi profilini yangilash",
)
async def update_my_profile(
    data: UpdateUserProfileRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    updated = await service.update_user_profile(current_user, data)
    return UserResponse(
        id=updated.id,
        phone=updated.phone,
        email=updated.email,  # type: ignore
        is_active=updated.is_active,
        is_verified=updated.is_verified,
        created_at=updated.created_at,
        profile=UserProfileResponse.model_validate(updated.profile) if updated.profile else None,
        roles=[r.name for r in updated.roles] if updated.roles else [],
    )


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Foydalanuvchi ochiq profilini olish",
)
async def get_user_by_id(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    user = await service.get_user_by_id(user_id)
    return UserResponse(
        id=user.id,
        phone=user.phone,
        email=user.email,  # type: ignore
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at,
        profile=UserProfileResponse.model_validate(user.profile) if user.profile else None,
        roles=[r.name for r in user.roles] if user.roles else [],
    )

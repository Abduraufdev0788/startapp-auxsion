from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.auth.schemas import (
    AuthUserResponse,
    LoginRequest,
    LogoutRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
)
from app.modules.auth.service import AuthService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi foydalanuvchini ro'yxatdan o'tkazish",
)
async def register(
    data: RegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    _, tokens = await service.register(data, ip_address, user_agent)
    return tokens


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Tizimga kirish va tokenlarni olish",
)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    _, tokens = await service.login(data, ip_address, user_agent)
    return tokens


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Access tokenni yangilash (Refresh rotation)",
)
async def refresh_token(
    data: RefreshTokenRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return await service.refresh_tokens(data.refresh_token, ip_address, user_agent)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Sessiyani bekor qilish va tizimdan chiqish",
)
async def logout(
    data: LogoutRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    await service.logout(data.refresh_token)
    return {"message": "Muvaffaqiyatli tizimdan chiqildi"}


@router.get(
    "/me",
    response_model=AuthUserResponse,
    status_code=status.HTTP_200_OK,
    summary="Joriy kirgan foydalanuvchini tekshirish",
)
async def get_me(
    current_user: UserModel = Depends(get_current_active_user),
):
    return AuthUserResponse(
        id=current_user.id,
        phone=current_user.phone,
        email=current_user.email,
        full_name=current_user.profile.full_name if current_user.profile else "Foydalanuvchi",
        roles=[r.name for r in current_user.roles] if current_user.roles else [],
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
    )


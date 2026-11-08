import uuid
from typing import List, Optional
from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_token
from app.core.constants import UserRole
from app.database.session import get_db
from app.modules.users.models import UserModel
from app.modules.users.repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> UserModel:
    """Extract and validate current user from JWT access token."""
    # Fallback to Authorization header if oauth2_scheme doesn't catch it
    auth_token = token
    if not auth_token and authorization:
        if authorization.startswith("Bearer "):
            auth_token = authorization.split(" ")[1]

    if not auth_token:
        raise UnauthorizedException("Avtorizatsiya talab qilinadi", error_code="TOKEN_MISSING")

    try:
        payload = decode_token(auth_token, is_refresh=False)
        if payload.get("type") != "access":
            raise UnauthorizedException("Yaroqsiz token turi", error_code="INVALID_TOKEN_TYPE")
        user_id = uuid.UUID(payload["sub"])
    except Exception:
        raise UnauthorizedException("Yaroqsiz yoki muddati o'tgan access token", error_code="INVALID_ACCESS_TOKEN")

    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)

    if not user:
        raise UnauthorizedException("Foydalanuvchi topilmadi", error_code="USER_NOT_FOUND")

    if not user.is_active:
        raise UnauthorizedException("Foydalanuvchi akkaunti faolsizlantirilgan", error_code="USER_INACTIVE")

    return user


async def get_current_active_user(
    current_user: UserModel = Depends(get_current_user),
) -> UserModel:
    return current_user


def require_roles(*allowed_roles: UserRole):
    """Dependency factory that ensures user has at least one of the required roles."""
    async def role_checker(current_user: UserModel = Depends(get_current_active_user)) -> UserModel:
        user_roles = {r.name for r in current_user.roles} if current_user.roles else set()
        allowed_names = {r.value for r in allowed_roles}

        # SUPER_ADMIN has access to everything
        if UserRole.SUPER_ADMIN.value in user_roles:
            return current_user

        if not any(r in allowed_names for r in user_roles):
            raise ForbiddenException(
                "Ushbu amalni bajarish uchun sizda yetarli huquq mavjud emas",
                error_code="INSUFFICIENT_PERMISSIONS",
            )
        return current_user

    return role_checker


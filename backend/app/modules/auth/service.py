import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import (
    BadRequestException,
    ConflictException,
    NotFoundException,
    UnauthorizedException,
)
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.core.constants import UserRole
from app.modules.auth.repository import AuthRepository
from app.modules.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
)
from app.modules.users.models import UserModel
from app.modules.users.repository import UserRepository
from app.utils.validators import validate_password_strength, validate_uz_phone


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.auth_repo = AuthRepository(db)

    def _hash_token(self, token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    async def register(
        self,
        data: RegisterRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[UserModel, TokenResponse]:
        # Validate inputs
        clean_phone = validate_uz_phone(data.phone)
        validate_password_strength(data.password)

        # Check existing user
        existing_phone = await self.user_repo.get_by_phone(clean_phone)
        if existing_phone:
            raise ConflictException(
                "Ushbu telefon raqami bilan foydalanuvchi allaqachon ro'yxatdan o'tgan",
                error_code="PHONE_EXISTS",
            )

        if data.email:
            existing_email = await self.user_repo.get_by_email(str(data.email))
            if existing_email:
                raise ConflictException(
                    "Ushbu elektron pochta bilan foydalanuvchi allaqachon ro'yxatdan o'tgan",
                    error_code="EMAIL_EXISTS",
                )

        hashed_password = get_password_hash(data.password)

        user = await self.user_repo.create_user(
            phone=clean_phone,
            hashed_password=hashed_password,
            full_name=data.full_name,
            email=str(data.email) if data.email else None,
            default_role=UserRole.USER.value,
        )

        tokens = await self._generate_tokens_and_session(user, ip_address, user_agent)
        await self.db.commit()
        return user, tokens

    async def login(
        self,
        data: LoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> Tuple[UserModel, TokenResponse]:
        clean_phone = validate_uz_phone(data.phone)
        user = await self.user_repo.get_by_phone(clean_phone)

        if not user or not verify_password(data.password, user.hashed_password):
            raise UnauthorizedException(
                "Telefon raqam yoki parol noto'g'ri",
                error_code="INVALID_CREDENTIALS",
            )

        if not user.is_active:
            raise UnauthorizedException(
                "Foydalanuvchi akkaunti faolsizlantirilgan",
                error_code="ACCOUNT_INACTIVE",
            )

        tokens = await self._generate_tokens_and_session(user, ip_address, user_agent)
        await self.db.commit()
        return user, tokens

    async def refresh_tokens(
        self,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        try:
            payload = decode_token(refresh_token, is_refresh=True)
            if payload.get("type") != "refresh":
                raise UnauthorizedException("Yaroqsiz token turi", error_code="INVALID_TOKEN_TYPE")
            user_id = uuid.UUID(payload["sub"])
        except Exception:
            raise UnauthorizedException("Yaroqsiz yoki muddati o'tgan refresh token", error_code="INVALID_REFRESH_TOKEN")

        token_hash = self._hash_token(refresh_token)
        session = await self.auth_repo.get_active_session(token_hash)
        if not session:
            raise UnauthorizedException("Sessiya topilmadi yoki bekor qilingan", error_code="SESSION_REVOKED")

        # Rotate: revoke old session
        await self.auth_repo.revoke_session(token_hash)

        user = await self.user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise UnauthorizedException("Foydalanuvchi topilmadi yoki faol emas", error_code="USER_NOT_FOUND")

        tokens = await self._generate_tokens_and_session(user, ip_address, user_agent)
        await self.db.commit()
        return tokens

    async def logout(self, refresh_token: str) -> None:
        token_hash = self._hash_token(refresh_token)
        await self.auth_repo.revoke_session(token_hash)
        await self.db.commit()

    async def _generate_tokens_and_session(
        self,
        user: UserModel,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        role_names = [r.name for r in user.roles] if user.roles else [UserRole.USER.value]
        access_token = create_access_token(
            subject=user.id,
            claims={"roles": role_names, "phone": user.phone},
        )
        refresh_token = create_refresh_token(subject=user.id)

        # Store session in DB
        refresh_hash = self._hash_token(refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

        await self.auth_repo.create_session(
            user_id=user.id,
            refresh_token_hash=refresh_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )


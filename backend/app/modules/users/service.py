import uuid
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.users.models import UserModel
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UpdateUserProfileRequest, UserResponse


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_user_by_id(self, user_id: uuid.UUID) -> UserModel:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Foydalanuvchi topilmadi", error_code="USER_NOT_FOUND")
        return user

    async def update_user_profile(
        self,
        current_user: UserModel,
        data: UpdateUserProfileRequest,
    ) -> UserModel:
        if data.email and data.email != current_user.email:
            existing = await self.user_repo.get_by_email(str(data.email))
            if existing and existing.id != current_user.id:
                raise ConflictException("Ushbu elektron pochta allaqachon band", error_code="EMAIL_EXISTS")

        updated_user = await self.user_repo.update_profile(
            user=current_user,
            full_name=data.full_name,
            avatar_url=data.avatar_url,
            bio=data.bio,
            city=data.city,
            address=data.address,
            email=str(data.email) if data.email else None,
        )
        await self.db.commit()
        return updated_user

    async def change_password(
        self, current_user: UserModel, old_password: str, new_password: str
    ) -> None:
        from app.core.security import verify_password, get_password_hash
        from app.core.exceptions import BadRequestException

        if not verify_password(old_password, current_user.hashed_password):
            raise BadRequestException("Amaldagi parol noto'g'ri kiritildi", error_code="INVALID_OLD_PASSWORD")

        if len(new_password) < 8:
            raise BadRequestException("Yangi parol kamida 8 ta belgidan iborat bo'lishi shart", error_code="WEAK_PASSWORD")

        current_user.hashed_password = get_password_hash(new_password)
        await self.db.commit()


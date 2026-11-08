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


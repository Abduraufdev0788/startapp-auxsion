import uuid
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.users.models import UserModel, UserProfileModel
from app.modules.auth.models import RoleModel, UserRoleModel
from app.core.constants import UserRole


class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[UserModel]:
        stmt = (
            select(UserModel)
            .options(selectinload(UserModel.profile), selectinload(UserModel.roles))
            .where(UserModel.id == user_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_phone(self, phone: str) -> Optional[UserModel]:
        stmt = (
            select(UserModel)
            .options(selectinload(UserModel.profile), selectinload(UserModel.roles))
            .where(UserModel.phone == phone)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[UserModel]:
        stmt = (
            select(UserModel)
            .options(selectinload(UserModel.profile), selectinload(UserModel.roles))
            .where(UserModel.email == email)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_or_create_role(self, role_name: str) -> RoleModel:
        stmt = select(RoleModel).where(RoleModel.name == role_name)
        result = await self.db.execute(stmt)
        role = result.scalar_one_or_none()
        if not role:
            role = RoleModel(name=role_name, description=f"{role_name} platform role")
            self.db.add(role)
            await self.db.flush()
        return role

    async def create_user(
        self,
        phone: str,
        hashed_password: str,
        full_name: str,
        email: Optional[str] = None,
        default_role: str = UserRole.USER.value,
    ) -> UserModel:
        user = UserModel(
            phone=phone,
            hashed_password=hashed_password,
            email=email,
            is_active=True,
            is_verified=False,
        )
        self.db.add(user)
        await self.db.flush()

        profile = UserProfileModel(
            user_id=user.id,
            full_name=full_name,
        )
        self.db.add(profile)

        role = await self.get_or_create_role(default_role)
        user_role = UserRoleModel(user_id=user.id, role_id=role.id)
        self.db.add(user_role)

        await self.db.flush()
        # Reload user with relationships
        return await self.get_by_id(user.id)  # type: ignore

    async def update_profile(
        self,
        user: UserModel,
        full_name: Optional[str] = None,
        avatar_url: Optional[str] = None,
        bio: Optional[str] = None,
        city: Optional[str] = None,
        address: Optional[str] = None,
        email: Optional[str] = None,
    ) -> UserModel:
        if email is not None:
            user.email = email

        if not user.profile:
            profile = UserProfileModel(user_id=user.id, full_name=full_name or "Foydalanuvchi")
            self.db.add(profile)
            user.profile = profile

        if full_name is not None:
            user.profile.full_name = full_name
        if avatar_url is not None:
            user.profile.avatar_url = avatar_url
        if bio is not None:
            user.profile.bio = bio
        if city is not None:
            user.profile.city = city
        if address is not None:
            user.profile.address = address

        await self.db.flush()
        return user

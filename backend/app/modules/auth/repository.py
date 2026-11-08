import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import UserSessionModel


class AuthRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_session(
        self,
        user_id: uuid.UUID,
        refresh_token_hash: str,
        expires_at: datetime,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSessionModel:
        session = UserSessionModel(
            user_id=user_id,
            refresh_token_hash=refresh_token_hash,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent,
            is_revoked=False,
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_active_session(self, refresh_token_hash: str) -> Optional[UserSessionModel]:
        now = datetime.now(timezone.utc)
        stmt = select(UserSessionModel).where(
            UserSessionModel.refresh_token_hash == refresh_token_hash,
            UserSessionModel.is_revoked == False,  # noqa: E712
            UserSessionModel.expires_at > now,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def revoke_session(self, refresh_token_hash: str) -> None:
        stmt = (
            update(UserSessionModel)
            .where(UserSessionModel.refresh_token_hash == refresh_token_hash)
            .values(is_revoked=True)
        )
        await self.db.execute(stmt)

    async def revoke_all_user_sessions(self, user_id: uuid.UUID) -> None:
        stmt = (
            update(UserSessionModel)
            .where(UserSessionModel.user_id == user_id)
            .values(is_revoked=True)
        )
        await self.db.execute(stmt)


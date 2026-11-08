import uuid
from typing import List, Optional
from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import NotificationModel


class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_notification(
        self,
        user_id: uuid.UUID,
        title: str,
        message: str,
        type: str = "INFO",
        link: Optional[str] = None,
    ) -> NotificationModel:
        notif = NotificationModel(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            link=link,
            is_read=False,
        )
        self.db.add(notif)
        await self.db.flush()
        return notif

    async def list_by_user(
        self, user_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> List[NotificationModel]:
        stmt = (
            select(NotificationModel)
            .where(NotificationModel.user_id == user_id)
            .order_by(NotificationModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count_unread(self, user_id: uuid.UUID) -> int:
        stmt = select(func.count(NotificationModel.id)).where(
            NotificationModel.user_id == user_id,
            NotificationModel.is_read == False,  # noqa: E712
        )
        result = await self.db.execute(stmt)
        return result.scalar() or 0

    async def mark_as_read(
        self, notification_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[NotificationModel]:
        stmt = select(NotificationModel).where(
            NotificationModel.id == notification_id,
            NotificationModel.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        notif = result.scalar_one_or_none()
        if notif:
            notif.is_read = True
            await self.db.flush()
        return notif

    async def mark_all_as_read(self, user_id: uuid.UUID) -> None:
        stmt = (
            update(NotificationModel)
            .where(
                NotificationModel.user_id == user_id,
                NotificationModel.is_read == False,  # noqa: E712
            )
            .values(is_read=True)
        )
        await self.db.execute(stmt)
        await self.db.flush()

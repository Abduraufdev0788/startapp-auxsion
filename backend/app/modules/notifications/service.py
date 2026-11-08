import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.notifications.models import NotificationModel
from app.modules.notifications.repository import NotificationRepository


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = NotificationRepository(db)

    async def notify_user(
        self,
        user_id: uuid.UUID,
        title: str,
        message: str,
        type: str = "INFO",
        link: Optional[str] = None,
    ) -> NotificationModel:
        notif = await self.repo.create_notification(
            user_id=user_id,
            title=title,
            message=message,
            type=type,
            link=link,
        )
        await self.db.commit()
        return notif

    async def list_notifications(
        self, user_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> List[NotificationModel]:
        return await self.repo.list_by_user(user_id, limit, offset)

    async def get_unread_count(self, user_id: uuid.UUID) -> int:
        return await self.repo.count_unread(user_id)

    async def mark_read(
        self, notification_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[NotificationModel]:
        notif = await self.repo.mark_as_read(notification_id, user_id)
        await self.db.commit()
        return notif

    async def mark_all_read(self, user_id: uuid.UUID) -> None:
        await self.repo.mark_all_as_read(user_id)
        await self.db.commit()

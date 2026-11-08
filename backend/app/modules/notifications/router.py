import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.notifications.schemas import (
    NotificationResponse,
    NotificationUnreadCountResponse,
)
from app.modules.notifications.service import NotificationService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get(
    "",
    response_model=List[NotificationResponse],
    status_code=status.HTTP_200_OK,
    summary="Foydalanuvchining barcha bildirishnomalari",
)
async def list_notifications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    return await service.list_notifications(current_user.id, limit, offset)


@router.get(
    "/unread-count",
    response_model=NotificationUnreadCountResponse,
    status_code=status.HTTP_200_OK,
    summary="O'qilmagan bildirishnomalar soni",
)
async def get_unread_count(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    count = await service.get_unread_count(current_user.id)
    return NotificationUnreadCountResponse(unread_count=count)


@router.patch(
    "/{notification_id}/read",
    response_model=NotificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Bildirishnomani o'qilgan deb belgilash",
)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    notif = await service.mark_read(notification_id, current_user.id)
    return notif


@router.post(
    "/read-all",
    status_code=status.HTTP_200_OK,
    summary="Barcha bildirishnomalarni o'qilgan deb belgilash",
)
async def mark_all_read(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = NotificationService(db)
    await service.mark_all_read(current_user.id)
    return {"message": "Barcha bildirishnomalar o'qilgan deb belgilandi"}

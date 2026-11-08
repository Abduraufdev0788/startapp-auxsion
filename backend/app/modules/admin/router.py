import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.database.session import get_db
from app.modules.auth.dependencies import require_roles
from app.modules.admin.schemas import (
    AdminAuditLogResponse,
    AdminDashboardMetricsResponse,
    ModerateAuctionRequest,
    UpdateUserStatusRequest,
)
from app.modules.admin.service import AdminService
from app.modules.auctions.schemas import AuctionResponse
from app.modules.disputes.schemas import DisputeResolveRequest, DisputeResponse
from app.modules.disputes.service import DisputeService
from app.modules.users.models import UserModel
from app.modules.users.schemas import UserResponse

router = APIRouter(
    prefix="/admin",
    tags=["Administration"],
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))],
)


@router.get(
    "/dashboard",
    response_model=AdminDashboardMetricsResponse,
    status_code=status.HTTP_200_OK,
    summary="Platforma ma'muriy statistikasi va metrikalari",
)
async def get_dashboard_metrics(
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.get_dashboard_metrics()


@router.post(
    "/auctions/{auction_id}/moderate",
    response_model=AuctionResponse,
    status_code=status.HTTP_200_OK,
    summary="Auksionni moderatsiyadan o'tkazish (Tasdiqlash yoki rad etish)",
)
async def moderate_auction(
    auction_id: uuid.UUID,
    data: ModerateAuctionRequest,
    request: Request,
    current_admin: UserModel = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    ip_address = request.client.host if request.client else None
    return await service.moderate_auction(auction_id, current_admin.id, data, ip_address)


@router.patch(
    "/users/{user_id}/status",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Foydalanuvchini bloklash yoki faollashtirish",
)
async def update_user_status(
    user_id: uuid.UUID,
    data: UpdateUserStatusRequest,
    request: Request,
    current_admin: UserModel = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    ip_address = request.client.host if request.client else None
    return await service.update_user_status(user_id, current_admin.id, data, ip_address)


@router.post(
    "/disputes/{dispute_id}/resolve",
    response_model=DisputeResponse,
    status_code=status.HTTP_200_OK,
    summary="Nizoli holatni hal qilish va qaror chiqarish",
)
async def resolve_dispute(
    dispute_id: uuid.UUID,
    data: DisputeResolveRequest,
    current_admin: UserModel = Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    service = DisputeService(db)
    return await service.resolve_dispute(dispute_id, current_admin.id, data)


@router.get(
    "/audit-logs",
    response_model=List[AdminAuditLogResponse],
    status_code=status.HTTP_200_OK,
    summary="Ma'muriyat audit xatti-harakatlari jurnali",
)
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = AdminService(db)
    return await service.list_audit_logs(limit, offset)

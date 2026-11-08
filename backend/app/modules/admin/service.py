import uuid
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AuctionStatus
from app.core.exceptions import NotFoundException
from app.modules.admin.models import AdminAuditLogModel
from app.modules.admin.repository import AdminRepository
from app.modules.admin.schemas import (
    AdminDashboardMetricsResponse,
    ModerateAuctionRequest,
    UpdateUserStatusRequest,
)
from app.modules.auctions.models import AuctionModel
from app.modules.auctions.repository import AuctionRepository
from app.modules.users.models import UserModel
from app.modules.users.repository import UserRepository


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = AdminRepository(db)
        self.auction_repo = AuctionRepository(db)
        self.user_repo = UserRepository(db)

    async def get_dashboard_metrics(self) -> AdminDashboardMetricsResponse:
        metrics = await self.repo.get_metrics()
        return AdminDashboardMetricsResponse(**metrics)

    async def moderate_auction(
        self,
        auction_id: uuid.UUID,
        admin_id: uuid.UUID,
        data: ModerateAuctionRequest,
        ip_address: Optional[str] = None,
    ) -> AuctionModel:
        auction = await self.auction_repo.get_by_id(auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        new_status = AuctionStatus.SCHEDULED.value if data.decision == "APPROVED" else AuctionStatus.CANCELLED.value
        await self.auction_repo.update_status(auction, new_status)

        # Record moderation record
        await self.repo.record_moderation(
            target_type="AUCTION",
            target_id=auction_id,
            moderator_id=admin_id,
            decision=data.decision,
            reason=data.reason,
        )

        # Record immutable audit log
        await self.repo.log_action(
            admin_id=admin_id,
            action=f"AUCTION_MODERATION_{data.decision}",
            target_type="AUCTION",
            target_id=str(auction_id),
            details=f"Auction status set to {new_status}. Reason: {data.reason}",
            ip_address=ip_address,
        )

        await self.db.commit()
        return auction

    async def update_user_status(
        self,
        user_id: uuid.UUID,
        admin_id: uuid.UUID,
        data: UpdateUserStatusRequest,
        ip_address: Optional[str] = None,
    ) -> UserModel:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundException("Foydalanuvchi topilmadi", error_code="USER_NOT_FOUND")

        user.is_active = data.is_active

        action_name = "USER_ACTIVATED" if data.is_active else "USER_SUSPENDED"
        await self.repo.log_action(
            admin_id=admin_id,
            action=action_name,
            target_type="USER",
            target_id=str(user_id),
            details=f"User status set to active={data.is_active}. Reason: {data.reason}",
            ip_address=ip_address,
        )

        await self.db.commit()
        return user

    async def list_audit_logs(
        self, limit: int = 50, offset: int = 0
    ) -> List[AdminAuditLogModel]:
        return await self.repo.list_audit_logs(limit, offset)

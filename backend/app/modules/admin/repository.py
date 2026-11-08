import uuid
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AuctionStatus, DisputeStatus
from app.modules.admin.models import AdminAuditLogModel, ModerationRecordModel
from app.modules.auctions.models import AuctionModel, AuctionResultModel
from app.modules.disputes.models import DisputeModel
from app.modules.settlements.models import SellerSettlementModel
from app.modules.users.models import UserModel


class AdminRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_action(
        self,
        admin_id: uuid.UUID,
        action: str,
        target_type: str,
        target_id: str,
        details: str,
        ip_address: Optional[str] = None,
    ) -> AdminAuditLogModel:
        log = AdminAuditLogModel(
            admin_id=admin_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            details=details,
            ip_address=ip_address,
        )
        self.db.add(log)
        await self.db.flush()
        return log

    async def list_audit_logs(
        self, limit: int = 50, offset: int = 0
    ) -> List[AdminAuditLogModel]:
        stmt = (
            select(AdminAuditLogModel)
            .order_by(AdminAuditLogModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def record_moderation(
        self,
        target_type: str,
        target_id: uuid.UUID,
        moderator_id: uuid.UUID,
        decision: str,
        reason: Optional[str] = None,
    ) -> ModerationRecordModel:
        rec = ModerationRecordModel(
            target_type=target_type,
            target_id=target_id,
            moderator_id=moderator_id,
            decision=decision,
            reason=reason,
        )
        self.db.add(rec)
        await self.db.flush()
        return rec

    async def get_metrics(self) -> dict:
        total_users = (
            await self.db.execute(select(func.count(UserModel.id)))
        ).scalar() or 0

        active_auctions = (
            await self.db.execute(
                select(func.count(AuctionModel.id)).where(
                    AuctionModel.status == AuctionStatus.ACTIVE.value
                )
            )
        ).scalar() or 0

        completed_auctions = (
            await self.db.execute(
                select(func.count(AuctionModel.id)).where(
                    AuctionModel.status == AuctionStatus.COMPLETED.value
                )
            )
        ).scalar() or 0

        pending_moderation = (
            await self.db.execute(
                select(func.count(AuctionModel.id)).where(
                    AuctionModel.status == AuctionStatus.PENDING_MODERATION.value
                )
            )
        ).scalar() or 0

        open_disputes = (
            await self.db.execute(
                select(func.count(DisputeModel.id)).where(
                    DisputeModel.status == DisputeStatus.OPEN.value
                )
            )
        ).scalar() or 0

        # Total GMV and Revenue
        gmv_tiyin = (
            await self.db.execute(select(func.sum(AuctionResultModel.winning_bid)))
        ).scalar() or 0

        revenue_tiyin = (
            await self.db.execute(select(func.sum(SellerSettlementModel.platform_fee)))
        ).scalar() or 0

        return {
            "total_users": total_users,
            "active_auctions": active_auctions,
            "completed_auctions": completed_auctions,
            "pending_moderation": pending_moderation,
            "open_disputes": open_disputes,
            "total_gmv_uzs": float(gmv_tiyin) / 100.0,
            "platform_revenue_uzs": float(revenue_tiyin) / 100.0,
        }

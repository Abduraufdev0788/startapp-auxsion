import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AdminDashboardMetricsResponse(BaseModel):
    total_users: int
    active_auctions: int
    completed_auctions: int
    total_gmv_uzs: float
    platform_revenue_uzs: float
    open_disputes: int
    pending_moderation: int


class ModerateAuctionRequest(BaseModel):
    decision: str = Field(..., description="APPROVED, REJECTED")
    reason: Optional[str] = Field(None, max_length=500)


class UpdateUserStatusRequest(BaseModel):
    is_active: bool
    reason: Optional[str] = Field(None, max_length=500)


class AdminAuditLogResponse(BaseModel):
    id: uuid.UUID
    admin_id: uuid.UUID
    action: str
    target_type: str
    target_id: str
    details: str
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

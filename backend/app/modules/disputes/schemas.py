import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class DisputeCreateRequest(BaseModel):
    auction_id: uuid.UUID
    reason: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=15, max_length=2000)


class DisputeResolveRequest(BaseModel):
    resolution: str = Field(..., description="RESOLVED_BUYER_FAVOR, RESOLVED_SELLER_FAVOR, CLOSED")
    notes: str = Field(..., min_length=10, max_length=1000)


class DisputeResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    raised_by_id: uuid.UUID
    reason: str
    description: str
    status: str
    resolution_notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

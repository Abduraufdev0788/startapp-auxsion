import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class BidCreateRequest(BaseModel):
    amount_uzs: int = Field(..., gt=0, description="Taklif qilinayotgan summa (so'm)")


class BidResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    user_id: uuid.UUID
    amount: int  # in tiyin
    amount_uzs: float
    created_at: datetime
    bidder_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

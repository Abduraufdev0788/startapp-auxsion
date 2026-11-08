import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class RefundResponse(BaseModel):
    id: uuid.UUID
    deposit_id: uuid.UUID
    user_id: uuid.UUID
    amount: int
    status: str
    provider_refund_id: Optional[str] = None
    retry_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

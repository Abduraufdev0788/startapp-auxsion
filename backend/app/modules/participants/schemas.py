import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ParticipantResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    user_id: uuid.UUID
    deposit_id: uuid.UUID
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ParticipationStatusResponse(BaseModel):
    is_eligible: bool
    is_seller: bool
    deposit_status: str
    participant_status: str
    deposit_amount: int

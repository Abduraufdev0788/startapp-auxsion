import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class PaymentInitiateRequest(BaseModel):
    transaction_type: str = Field(..., description="DEPOSIT, WINNER_PAYMENT")
    auction_id: uuid.UUID
    amount_uzs: int = Field(..., gt=0, description="Summa (so'm)")


class PaymentInitiateResponse(BaseModel):
    transaction_id: uuid.UUID
    provider_transaction_id: str
    checkout_url: str
    amount: int
    currency: str


class WinnerSettlementRequest(BaseModel):
    auction_id: uuid.UUID


class PaymentTransactionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    transaction_type: str
    amount: int
    currency: str
    status: str
    provider: str
    provider_transaction_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

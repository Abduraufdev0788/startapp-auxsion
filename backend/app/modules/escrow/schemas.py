import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class LedgerEntryResponse(BaseModel):
    id: uuid.UUID
    transaction_id: uuid.UUID
    account_id: uuid.UUID
    debit_amount: int
    credit_amount: int
    currency: str
    description: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EscrowTransactionResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    buyer_id: uuid.UUID
    seller_id: uuid.UUID
    amount: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

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


class WalletBalanceResponse(BaseModel):
    balance_tiyin: int
    balance_uzs: int
    formatted_balance: str
    locked_deposits_tiyin: int
    locked_deposits_uzs: int
    formatted_locked: str
    currency: str = "UZS"


class WithdrawalRequest(BaseModel):
    amount_uzs: int = Field(..., gt=0, description="Yechib olinadigan summa (UZS)")
    card_number: str = Field(..., min_length=16, max_length=25, description="16 xonali karta raqami")
    card_holder: Optional[str] = Field(None, max_length=100, description="Karta egasi F.I.O")


class WithdrawalResponse(BaseModel):
    id: uuid.UUID
    amount_tiyin: int
    amount_uzs: int
    formatted_amount: str
    card_number_masked: str
    card_holder: Optional[str] = None
    card_type: str
    status: str
    provider_ref: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WalletTransactionItem(BaseModel):
    id: uuid.UUID
    type: str  # DEPOSIT_REFUND, WITHDRAWAL, DEPOSIT_PAYMENT, BALANCE_TOPUP
    amount_tiyin: int
    amount_uzs: int
    formatted_amount: str
    description: str
    created_at: datetime
    status: str
    is_credit: bool

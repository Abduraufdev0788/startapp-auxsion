import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.modules.products.schemas import ProductResponse


class AuctionCreateRequest(BaseModel):
    product_id: uuid.UUID
    # User provides whole UZS (sum) in request
    starting_price_uzs: int = Field(..., gt=0, description="Boshlang'ich narx (so'm)")
    reserve_price_uzs: int = Field(..., gt=0, description="Minimal sotish narxi (so'm)")
    min_bid_increment_uzs: int = Field(..., gt=0, description="Minimal qadam (so'm)")
    deposit_amount_uzs: int = Field(..., gt=0, description="Depozit summasi (so'm)")

    start_time: datetime = Field(..., description="Auksion boshlanish vaqti")
    end_time: datetime = Field(..., description="Auksion tugash vaqti")
    delivery_info: Optional[str] = Field(None, max_length=1000)
    rules: Optional[str] = Field(None, max_length=1000)

    @model_validator(mode="after")
    def validate_auction_rules(self) -> "AuctionCreateRequest":
        # 1. Starting price must not exceed reserve price
        if self.starting_price_uzs > self.reserve_price_uzs:
            raise ValueError("Boshlang'ich narx minimal sotish narxidan oshmasligi shart")

        # 2. End time must be strictly after start time
        if self.end_time <= self.start_time:
            raise ValueError("Auksion tugash vaqti boshlanish vaqtidan keyin bo'lishi shart")

        return self


class AuctionResponse(BaseModel):
    id: uuid.UUID
    seller_id: uuid.UUID
    product_id: uuid.UUID

    # Stored in BigInteger tiyin
    starting_price: int
    reserve_price: int
    min_bid_increment: int
    deposit_amount: int

    current_highest_bid: int
    highest_bidder_id: Optional[uuid.UUID] = None
    bid_count: int
    participant_count: int

    start_time: datetime
    end_time: datetime
    status: str
    delivery_info: Optional[str] = None
    rules: Optional[str] = None

    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)

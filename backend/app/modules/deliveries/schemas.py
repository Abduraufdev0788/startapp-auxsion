import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CreateDeliveryAddressRequest(BaseModel):
    shipping_address: str = Field(..., min_length=10, max_length=500, description="To'liq yetkazib berish manzili")


class UpdateShippingTrackingRequest(BaseModel):
    tracking_number: str = Field(..., min_length=3, max_length=100, description="Kuryer/pochta kuzatuv kodi")
    carrier: str = Field(..., min_length=2, max_length=100, description="Yetkazib beruvchi kompaniya nomi")


class DeliveryResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    buyer_id: uuid.UUID
    seller_id: uuid.UUID
    shipping_address: str
    tracking_number: Optional[str] = None
    carrier: Optional[str] = None
    status: str
    delivered_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

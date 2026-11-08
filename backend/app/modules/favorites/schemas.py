import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.modules.auctions.schemas import AuctionResponse


class FavoriteStatusResponse(BaseModel):
    auction_id: uuid.UUID
    is_favorite: bool


class FavoriteItemResponse(BaseModel):
    id: uuid.UUID
    auction_id: uuid.UUID
    created_at: datetime
    auction: Optional[AuctionResponse] = None

    model_config = ConfigDict(from_attributes=True)


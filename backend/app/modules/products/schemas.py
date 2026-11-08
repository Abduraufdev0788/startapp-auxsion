import uuid
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ProductImageResponse(BaseModel):
    id: uuid.UUID
    image_url: str
    is_primary: bool
    display_order: int

    model_config = ConfigDict(from_attributes=True)


class ProductCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    category_id: uuid.UUID
    condition: str = Field("NEW", description="NEW, LIKE_NEW, USED")


class ProductUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    category_id: Optional[uuid.UUID] = None
    condition: Optional[str] = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    seller_id: uuid.UUID
    category_id: uuid.UUID
    title: str
    description: str
    condition: str
    is_approved: bool
    created_at: datetime
    images: List[ProductImageResponse] = []

    model_config = ConfigDict(from_attributes=True)

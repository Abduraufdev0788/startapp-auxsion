import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=255)
    icon: Optional[str] = Field(None, max_length=100)
    display_order: int = Field(0, ge=0)
    parent_id: Optional[uuid.UUID] = None


class CategoryCreateRequest(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: uuid.UUID
    subcategories: List["CategoryResponse"] = []

    model_config = ConfigDict(from_attributes=True)

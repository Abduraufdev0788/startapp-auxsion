import uuid
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=120)
    description: Optional[str] = Field(None, max_length=255)
    icon: Optional[str] = Field(None, max_length=100)
    display_order: int = Field(0, ge=0)
    parent_id: Optional[uuid.UUID] = None


class CategoryCreateRequest(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: uuid.UUID
    slug: str
    subcategories: Optional[List["CategoryResponse"]] = Field(default_factory=list)

    @field_validator("subcategories", mode="before")
    @classmethod
    def handle_none_subcategories(cls, v):
        return v if v is not None else []

    model_config = ConfigDict(from_attributes=True)

import uuid
from typing import List, Optional
from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ProductModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "products"

    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    condition: Mapped[str] = mapped_column(String(50), default="NEW", nullable=False)  # NEW, LIKE_NEW, USED
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    images: Mapped[List["ProductImageModel"]] = relationship(
        "ProductImageModel", back_populates="product", cascade="all, delete-orphan", lazy="selectin"
    )

    __table_args__ = (
        Index("idx_products_seller", "seller_id"),
        Index("idx_products_category", "category_id"),
    )


class ProductImageModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "product_images"

    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    image_url: Mapped[str] = mapped_column(String(500), nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product: Mapped["ProductModel"] = relationship("ProductModel", back_populates="images")


import uuid
from typing import Optional
from datetime import datetime
from sqlalchemy import BigInteger, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.constants import AuctionStatus


class AuctionModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "auctions"

    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )

    # Monetary values in BigInteger tiyin (1 UZS = 100 tiyin)
    starting_price: Mapped[int] = mapped_column(BigInteger, nullable=False)
    reserve_price: Mapped[int] = mapped_column(BigInteger, nullable=False)  # Minimum selling price
    min_bid_increment: Mapped[int] = mapped_column(BigInteger, nullable=False)
    deposit_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)

    # State & Real-time tracking
    current_highest_bid: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    highest_bidder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    bid_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    participant_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Timeline (Server Authority)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)

    status: Mapped[str] = mapped_column(
        String(50),
        default=AuctionStatus.DRAFT.value,
        nullable=False,
        index=True,
    )

    delivery_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rules: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    product: Mapped["ProductModel"] = relationship("ProductModel", lazy="joined")
    result: Mapped[Optional["AuctionResultModel"]] = relationship(
        "AuctionResultModel", back_populates="auction", uselist=False
    )

    __table_args__ = (
        Index("idx_auctions_status_end_time", "status", "end_time"),
        Index("idx_auctions_seller", "seller_id"),
    )


class AuctionResultModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "auction_results"

    auction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auctions.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    winner_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    winning_bid: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    payment_deadline: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)

    auction: Mapped["AuctionModel"] = relationship("AuctionModel", back_populates="result")


class AuctionEventModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "auction_events"

    auction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auctions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)


import uuid
from typing import Optional
from sqlalchemy import BigInteger, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SellerSettlementModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "seller_settlements"

    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    auction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auctions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    gross_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    platform_fee: Mapped[int] = mapped_column(BigInteger, nullable=False)
    net_payout: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PENDING", nullable=False)  # PENDING, PAID, HELD
    payout_reference: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)


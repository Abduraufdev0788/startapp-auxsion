import uuid
from typing import Optional
from sqlalchemy import BigInteger, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.constants import Currency, DepositStatus


class DepositModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "deposits"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    auction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auctions.id", ondelete="RESTRICT"),
        nullable=False,
    )
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default=Currency.UZS.value, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default=DepositStatus.PENDING.value, nullable=False, index=True
    )
    payment_transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    provider_ref: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)

    __table_args__ = (
        UniqueConstraint("user_id", "auction_id", name="uq_user_auction_deposit"),
        Index("idx_deposits_user_auction", "user_id", "auction_id"),
        Index("idx_deposits_status", "status"),
    )


import uuid
from typing import Optional
from sqlalchemy import BigInteger, ForeignKey, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.constants import Currency, PaymentStatus, PaymentType


class PaymentTransactionModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "payment_transactions"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    transaction_type: Mapped[str] = mapped_column(
        String(50), default=PaymentType.DEPOSIT.value, nullable=False
    )
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default=Currency.UZS.value, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default=PaymentStatus.PENDING.value, nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_transaction_id: Mapped[Optional[str]] = mapped_column(
        String(150), unique=True, nullable=True, index=True
    )
    idempotency_key: Mapped[str] = mapped_column(
        String(150), unique=True, nullable=False, index=True
    )

    __table_args__ = (
        Index("idx_payments_user_status", "user_id", "status"),
    )


class PaymentWebhookEventModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "payment_webhook_events"

    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    event_id: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    payload: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="PROCESSED", nullable=False)


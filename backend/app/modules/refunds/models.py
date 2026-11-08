import uuid
from typing import Optional
from sqlalchemy import BigInteger, ForeignKey, Index, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.constants import RefundStatus


class RefundModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "refunds"

    deposit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("deposits.id", ondelete="RESTRICT"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(
        String(50), default=RefundStatus.REQUESTED.value, nullable=False, index=True
    )
    provider_refund_id: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    idempotency_key: Mapped[str] = mapped_column(
        String(150), unique=True, nullable=False, index=True
    )
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    failure_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


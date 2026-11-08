import uuid
from typing import Optional
from sqlalchemy import BigInteger, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.constants import Currency


class FinancialAccountModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "financial_accounts"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    account_type: Mapped[str] = mapped_column(String(50), nullable=False)  # USER_WALLET, PLATFORM_ESCROW, PLATFORM_REVENUE
    balance: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default=Currency.UZS.value, nullable=False)


class LedgerEntryModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    """Immutable double-entry financial ledger."""
    __tablename__ = "ledger_entries"

    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    account_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("financial_accounts.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    debit_amount: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    credit_amount: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default=Currency.UZS.value, nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)

    __table_args__ = (
        Index("idx_ledger_transaction", "transaction_id"),
        Index("idx_ledger_account", "account_id"),
    )


class EscrowTransactionModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "escrow_transactions"

    auction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auctions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    seller_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
    )
    amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="HELD", nullable=False)  # HELD, RELEASED, REFUNDED, DISPUTED


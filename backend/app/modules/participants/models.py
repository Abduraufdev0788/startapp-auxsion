import uuid
from sqlalchemy import ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.core.constants import ParticipantStatus


class AuctionParticipantModel(Base, TimestampMixin, UUIDPrimaryKeyMixin):
    __tablename__ = "auction_participants"

    auction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("auctions.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    deposit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("deposits.id", ondelete="RESTRICT"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(50), default=ParticipantStatus.ELIGIBLE.value, nullable=False
    )

    __table_args__ = (
        UniqueConstraint("auction_id", "user_id", name="uq_auction_participant"),
        Index("idx_participants_auction_user", "auction_id", "user_id"),
    )


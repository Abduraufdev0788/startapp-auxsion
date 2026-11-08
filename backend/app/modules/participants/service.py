import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import AuctionStatus, DepositStatus, ParticipantStatus
from app.core.exceptions import (
    AuctionNotActiveException,
    ConflictException,
    NotFoundException,
    SelfBiddingProhibitedException,
)
from app.modules.auctions.repository import AuctionRepository
from app.modules.deposits.repository import DepositRepository
from app.modules.participants.models import AuctionParticipantModel
from app.modules.participants.repository import ParticipantRepository
from app.modules.participants.schemas import ParticipationStatusResponse


class ParticipantService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ParticipantRepository(db)
        self.auction_repo = AuctionRepository(db)
        self.deposit_repo = DepositRepository(db)

    async def participate(
        self, auction_id: uuid.UUID, user_id: uuid.UUID
    ) -> AuctionParticipantModel:
        auction = await self.auction_repo.get_by_id(auction_id, for_update=True)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        # 1. Rule: Seller cannot participate in their own auction
        if auction.seller_id == user_id:
            raise SelfBiddingProhibitedException(
                "Sotuvchi o'z auksionida ishtirok eta olmaydi va depozit to'lay olmaydi"
            )

        # 2. Rule: Auction must be SCHEDULED or ACTIVE
        if auction.status not in [AuctionStatus.SCHEDULED.value, AuctionStatus.ACTIVE.value]:
            raise AuctionNotActiveException("Faqat rejalashtirilgan yoki faol auksionda ishtirok etish mumkin")

        # 3. Check if already participating
        existing = await self.repo.get_participant(auction_id, user_id)
        if existing:
            return existing

        # 4. Create Deposit (Auto-confirm in sandbox mode / provider integration)
        deposit = await self.deposit_repo.create_deposit(
            user_id=user_id,
            auction_id=auction_id,
            amount=auction.deposit_amount,
            status=DepositStatus.LOCKED.value,
            provider_ref=f"sandbox_dep_{uuid.uuid4().hex[:10]}",
        )

        # Check if user has available wallet balance; if so, deduct from wallet
        try:
            from app.modules.escrow.service import LedgerService
            ledger = LedgerService(self.db)
            account = await ledger.repo.get_or_create_account(account_type="USER_WALLET", user_id=user_id)
            if account.balance >= auction.deposit_amount:
                await ledger.record_transfer(
                    transaction_id=deposit.id,
                    from_account_type="USER_WALLET",
                    to_account_type="PLATFORM_ESCROW",
                    amount_tiyin=auction.deposit_amount,
                    description=f"Participation deposit paid from wallet for auction {auction.id}",
                    from_user_id=user_id,
                )
                deposit.provider_ref = f"wallet_dep_{uuid.uuid4().hex[:10]}"
        except Exception:
            pass

        # 5. Register participant
        participant = await self.repo.create_participant(
            auction_id=auction_id,
            user_id=user_id,
            deposit_id=deposit.id,
            status=ParticipantStatus.ELIGIBLE.value,
        )

        # Update participant count on auction
        auction.participant_count = await self.repo.count_by_auction(auction_id)

        await self.auction_repo.record_event(
            auction_id=auction.id,
            event_type="auction.participant.joined",
            payload=f"User {user_id} locked deposit and joined auction as eligible participant",
        )
        await self.db.commit()
        return participant

    async def get_participation_status(
        self, auction_id: uuid.UUID, user_id: uuid.UUID
    ) -> ParticipationStatusResponse:
        auction = await self.auction_repo.get_by_id(auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        is_seller = auction.seller_id == user_id
        participant = await self.repo.get_participant(auction_id, user_id)
        deposit = await self.deposit_repo.get_by_user_and_auction(user_id, auction_id)

        return ParticipationStatusResponse(
            is_eligible=bool(participant and participant.status == ParticipantStatus.ELIGIBLE.value),
            is_seller=is_seller,
            deposit_status=deposit.status if deposit else "NONE",
            participant_status=participant.status if participant else "NOT_REGISTERED",
            deposit_amount=auction.deposit_amount,
        )

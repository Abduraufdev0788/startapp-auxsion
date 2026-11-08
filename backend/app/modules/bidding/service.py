import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.constants import AuctionStatus, ParticipantStatus
from app.core.logging import logger
from app.core.exceptions import (
    AuctionNotActiveException,
    DepositRequiredException,
    InvalidBidAmountException,
    NotFoundException,
    SelfBiddingProhibitedException,
)
from app.modules.auctions.models import AuctionResultModel
from app.modules.auctions.repository import AuctionRepository
from app.modules.bidding.models import BidModel
from app.modules.bidding.repository import BiddingRepository
from app.modules.bidding.schemas import BidCreateRequest, BidResponse
from app.modules.participants.repository import ParticipantRepository
from app.modules.users.repository import UserRepository
from app.utils.money import format_uzs, tiyin_to_uzs_decimal, uzs_to_tiyin
from app.websocket.events import WSEvent, WSEventType
from app.websocket.manager import manager


class BiddingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BiddingRepository(db)
        self.auction_repo = AuctionRepository(db)
        self.participant_repo = ParticipantRepository(db)
        self.user_repo = UserRepository(db)

    async def submit_bid(
        self, auction_id: uuid.UUID, user_id: uuid.UUID, data: BidCreateRequest
    ) -> BidResponse:
        # 1. CRITICAL: Row-level lock on auction using PostgreSQL SELECT ... FOR UPDATE
        auction = await self.auction_repo.get_by_id(auction_id, for_update=True)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        # 2. Check auction is ACTIVE
        if auction.status != AuctionStatus.ACTIVE.value:
            raise AuctionNotActiveException("Auksion hozirda faol emas")

        # 3. Check authorative server clock against end_time
        now = datetime.now(timezone.utc)
        end_time = auction.end_time if auction.end_time.tzinfo else auction.end_time.replace(tzinfo=timezone.utc)
        if now >= end_time:
            # Auction expired - trigger finalization
            await self.finalize_auction(auction.id)
            raise AuctionNotActiveException("Auksion vaqti yakunlangan")

        # 4. Rule: Seller cannot bid on own auction
        if auction.seller_id == user_id:
            raise SelfBiddingProhibitedException("Sotuvchi o'z auksionida narx taklif qila olmaydi")

        # 5. Rule: User must have confirmed deposit and ELIGIBLE status
        participant = await self.participant_repo.get_participant(auction_id, user_id)
        if not participant or participant.status != ParticipantStatus.ELIGIBLE.value:
            raise DepositRequiredException(
                f"Taklif berish uchun {format_uzs(auction.deposit_amount)} kafolat depoziti to'lanishi shart"
            )

        # 6. Validate Bid Amount against current highest bid and min_bid_increment
        bid_amount_tiyin = uzs_to_tiyin(data.amount_uzs)

        if auction.bid_count == 0:
            min_required = auction.starting_price
        else:
            min_required = auction.current_highest_bid + auction.min_bid_increment

        if bid_amount_tiyin < min_required:
            raise InvalidBidAmountException(
                f"Taklif summasi minimal talab qilingan miqdordan kam: kamida {format_uzs(min_required)} bo'lishi shart"
            )

        # 7. Persist Immutable Bid
        bid = await self.repo.create_bid(auction_id, user_id, bid_amount_tiyin)

        # 8. Update Auction State
        previous_highest_bidder = auction.highest_bidder_id
        auction.current_highest_bid = bid_amount_tiyin
        auction.highest_bidder_id = user_id
        auction.bid_count += 1

        # 9. Anti-Sniping Protection: Auto-extend auction if bid placed in last N minutes
        time_left = end_time - now
        threshold = timedelta(minutes=settings.BID_EXTENSION_THRESHOLD_MINUTES)
        time_extended = False

        if time_left < threshold:
            extension = timedelta(minutes=settings.DEFAULT_BID_EXTENSION_MINUTES)
            auction.end_time = now + extension
            time_extended = True
            await self.auction_repo.record_event(
                auction_id=auction.id,
                event_type="auction.time.extended",
                payload=f"Anti-sniping: auction extended to {auction.end_time.isoformat()}",
            )

        user = await self.user_repo.get_by_id(user_id)
        bidder_name = user.profile.full_name if user and user.profile else "Ishtirokchi"

        await self.auction_repo.record_event(
            auction_id=auction.id,
            event_type="auction.bid.created",
            payload=f"Bid placed: {format_uzs(bid_amount_tiyin)} by user {user_id}",
        )

        await self.db.commit()

        # 10. Broadcast Real-Time WebSocket Event
        ws_payload = {
            "bid_id": str(bid.id),
            "amount_tiyin": bid_amount_tiyin,
            "amount_uzs": float(tiyin_to_uzs_decimal(bid_amount_tiyin)),
            "formatted_amount": format_uzs(bid_amount_tiyin),
            "bidder_name": bidder_name,
            "bid_count": auction.bid_count,
            "end_time": auction.end_time.isoformat(),
            "time_extended": time_extended,
        }
        await manager.broadcast_to_auction(
            str(auction.id),
            WSEvent(
                event=WSEventType.BID_CREATED,
                auction_id=str(auction.id),
                data=ws_payload,
            ),
        )

        return BidResponse(
            id=bid.id,
            auction_id=bid.auction_id,
            user_id=bid.user_id,
            amount=bid.amount,
            amount_uzs=float(tiyin_to_uzs_decimal(bid.amount)),
            created_at=bid.created_at,
            bidder_name=bidder_name,
        )

    async def list_bids(
        self, auction_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> List[BidResponse]:
        bids = await self.repo.list_bids(auction_id, limit, offset)
        results = []
        for b in bids:
            user = await self.user_repo.get_by_id(b.user_id)
            name = user.profile.full_name if user and user.profile else "Ishtirokchi"
            results.append(
                BidResponse(
                    id=b.id,
                    auction_id=b.auction_id,
                    user_id=b.user_id,
                    amount=b.amount,
                    amount_uzs=float(tiyin_to_uzs_decimal(b.amount)),
                    created_at=b.created_at,
                    bidder_name=name,
                )
            )
        return results

    async def finalize_auction(self, auction_id: uuid.UUID) -> None:
        """Lock and finalize auction state, determine winner or NO_WINNER."""
        auction = await self.auction_repo.get_by_id(auction_id, for_update=True)
        if not auction:
            return

        if auction.status not in [AuctionStatus.ACTIVE.value, AuctionStatus.FINALIZING.value]:
            return

        now = datetime.now(timezone.utc)
        deadline = now + timedelta(days=settings.DEFAULT_WINNER_PAYMENT_DEADLINE_DAYS)

        # Check if any bids placed and if highest bid met reserve price
        if auction.bid_count > 0 and auction.current_highest_bid >= auction.reserve_price:
            auction.status = AuctionStatus.COMPLETED.value
            result = AuctionResultModel(
                auction_id=auction.id,
                winner_id=auction.highest_bidder_id,
                winning_bid=auction.current_highest_bid,
                payment_deadline=deadline,
                payment_status="PENDING",
            )
            self.db.add(result)
            event_type = WSEventType.WINNER_DECLARED
            ws_data = {
                "winner_id": str(auction.highest_bidder_id),
                "winning_bid": auction.current_highest_bid,
                "formatted_winning_bid": format_uzs(auction.current_highest_bid),
                "payment_deadline": deadline.isoformat(),
            }
        else:
            auction.status = AuctionStatus.NO_WINNER.value
            result = AuctionResultModel(
                auction_id=auction.id,
                winner_id=None,
                winning_bid=None,
                payment_status="NO_WINNER",
            )
            self.db.add(result)
            event_type = WSEventType.COMPLETED
            ws_data = {
                "reason": "Zaxira narxiga yetmadi yoki taklif berilmadi",
                "status": "NO_WINNER",
            }

        await self.auction_repo.record_event(
            auction_id=auction.id,
            event_type=f"auction.finalized.{auction.status}",
            payload=json.dumps(ws_data),
        )
        await self.db.commit()

        # Automatically credit refunded deposits to non-winning participants' balances
        try:
            from app.modules.refunds.service import RefundService
            refund_service = RefundService(self.db)
            await refund_service.process_auction_refunds(
                auction_id=auction.id,
                winner_id=auction.highest_bidder_id if auction.status == AuctionStatus.COMPLETED.value else None,
            )
        except Exception as e:
            logger.error(f"Error executing auction refunds in finalize_auction: {e}")

        # Broadcast completion to WebSocket
        await manager.broadcast_to_auction(
            str(auction.id),
            WSEvent(
                event=event_type,
                auction_id=str(auction.id),
                data=ws_data,
            ),
        )

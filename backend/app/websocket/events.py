from enum import StrEnum
from typing import Any, Dict, Optional
from pydantic import BaseModel


class WSEventType(StrEnum):
    AUCTION_STARTED = "auction.started"
    BID_CREATED = "auction.bid.created"
    BID_OUTBID = "auction.bid.outbid"
    TIME_UPDATED = "auction.time.updated"
    ENDING_SOON = "auction.ending.soon"
    COMPLETED = "auction.completed"
    WINNER_DECLARED = "auction.winner.declared"
    CANCELLED = "auction.cancelled"
    ERROR = "error"


class WSEvent(BaseModel):
    event: WSEventType
    auction_id: Optional[str] = None
    data: Dict[str, Any]


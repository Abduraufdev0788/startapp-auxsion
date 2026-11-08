from pydantic import BaseModel
from typing import Optional


class WebhookPayload(BaseModel):
    event_id: str
    provider_transaction_id: str
    order_id: str
    amount_tiyin: int
    status: str
    signature: Optional[str] = None


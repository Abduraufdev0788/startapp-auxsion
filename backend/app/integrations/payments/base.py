from abc import ABC, abstractmethod
from typing import Any, Dict
from pydantic import BaseModel


class PaymentInitResult(BaseModel):
    transaction_id: str
    provider_transaction_id: str
    checkout_url: str
    amount: int
    currency: str


class RefundResult(BaseModel):
    refund_id: str
    provider_refund_id: str
    status: str
    amount: int


class BasePaymentProvider(ABC):
    """Abstract payment provider interface for Uzbekistan banking integrations."""

    @abstractmethod
    async def create_payment(
        self,
        order_id: str,
        amount_tiyin: int,
        description: str,
        return_url: str,
    ) -> PaymentInitResult:
        """Initiate payment session with provider and return redirect checkout URL."""
        pass

    @abstractmethod
    async def verify_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """Verify provider webhook payload integrity and signature."""
        pass

    @abstractmethod
    async def refund(
        self,
        provider_transaction_id: str,
        amount_tiyin: int,
        reason: str,
    ) -> RefundResult:
        """Process refund to user's payment source."""
        pass


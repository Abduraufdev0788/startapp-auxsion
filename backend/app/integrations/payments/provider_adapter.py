import uuid
from typing import Any, Dict
from app.core.config import settings
from app.core.security import verify_webhook_signature
from app.integrations.payments.base import BasePaymentProvider, PaymentInitResult, RefundResult


class SandboxPaymentProvider(BasePaymentProvider):
    """Sandbox payment adapter for testing and local development without real money transactions."""

    def __init__(self):
        self.merchant_id = settings.PAYMENT_MERCHANT_ID
        self.secret_key = settings.PAYMENT_SECRET_KEY
        self.webhook_secret = settings.PAYMENT_WEBHOOK_SECRET

    async def create_payment(
        self,
        order_id: str,
        amount_tiyin: int,
        description: str,
        return_url: str,
    ) -> PaymentInitResult:
        provider_txn_id = f"sandbox_txn_{uuid.uuid4().hex[:12]}"
        # Direct user to local frontend mock payment page
        checkout_url = f"{settings.FRONTEND_URL}/sandbox-payment?txn={provider_txn_id}&order={order_id}&amount={amount_tiyin}"
        return PaymentInitResult(
            transaction_id=order_id,
            provider_transaction_id=provider_txn_id,
            checkout_url=checkout_url,
            amount=amount_tiyin,
            currency="UZS",
        )

    async def verify_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        is_valid = verify_webhook_signature(payload, signature, self.webhook_secret)
        if not is_valid and settings.ENVIRONMENT == "production":
            raise ValueError("Invalid webhook signature from payment provider")
        return {"status": "SUCCESS", "verified": True}

    async def refund(
        self,
        provider_transaction_id: str,
        amount_tiyin: int,
        reason: str,
    ) -> RefundResult:
        provider_refund_id = f"sandbox_ref_{uuid.uuid4().hex[:12]}"
        return RefundResult(
            refund_id=f"ref_{uuid.uuid4().hex[:8]}",
            provider_refund_id=provider_refund_id,
            status="COMPLETED",
            amount=amount_tiyin,
        )


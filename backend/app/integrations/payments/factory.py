from app.core.config import settings
from app.integrations.payments.base import BasePaymentProvider
from app.integrations.payments.provider_adapter import SandboxPaymentProvider


def get_payment_provider() -> BasePaymentProvider:
    """Factory to retrieve configured payment provider adapter."""
    provider_name = settings.PAYMENT_PROVIDER.lower()
    if provider_name == "sandbox":
        return SandboxPaymentProvider()
    # In production, can plug ClickProvider, PaymeProvider, BankEscrowProvider
    return SandboxPaymentProvider()


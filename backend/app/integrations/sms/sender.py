from app.core.logging import logger


async def send_sms(phone: str, text: str) -> bool:
    """Send SMS to recipient (Mock / Sandbox for dev)."""
    logger.info(f"[SMS SANDBOX] Sending to {phone}: {text}")
    return True


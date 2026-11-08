from app.core.logging import logger


async def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send Email to recipient (Mock / Sandbox for dev)."""
    logger.info(f"[EMAIL SANDBOX] Sending to {to_email}: {subject}")
    return True


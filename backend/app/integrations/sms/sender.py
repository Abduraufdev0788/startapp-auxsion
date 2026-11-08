from typing import Optional
import httpx
from app.core.config import settings
from app.core.logging import logger

_eskiz_token: Optional[str] = None


async def _get_eskiz_token() -> Optional[str]:
    global _eskiz_token
    if _eskiz_token:
        return _eskiz_token
    if not settings.SMS_EMAIL or not settings.SMS_PASSWORD:
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post(
                "https://notify.eskiz.uz/api/auth/login",
                data={"email": settings.SMS_EMAIL, "password": settings.SMS_PASSWORD},
            )
            if res.status_code == 200:
                data = res.json()
                _eskiz_token = data.get("data", {}).get("token")
                return _eskiz_token
            else:
                logger.warning(f"Eskiz SMS auth failed ({res.status_code}): {res.text}")
    except Exception as e:
        logger.error(f"Failed to authenticate with Eskiz SMS API: {e}")
    return None


async def send_sms(phone: str, text: str) -> bool:
    """Send SMS to recipient via Eskiz.uz in production or sandbox log in dev."""
    if settings.SMS_PROVIDER.lower() == "eskiz" and settings.SMS_EMAIL and settings.SMS_PASSWORD:
        token = await _get_eskiz_token()
        if token:
            clean_phone = phone.replace("+", "").strip()
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    res = await client.post(
                        "https://notify.eskiz.uz/api/message/sms/send",
                        headers={"Authorization": f"Bearer {token}"},
                        data={
                            "mobile_phone": clean_phone,
                            "message": text,
                            "from": settings.SMS_FROM,
                        },
                    )
                    if res.status_code == 200:
                        logger.info(f"[SMS ESKIZ] Successfully sent SMS to {clean_phone}")
                        return True
                    else:
                        logger.warning(f"[SMS ESKIZ] Send failed ({res.status_code}): {res.text}")
            except Exception as e:
                logger.error(f"[SMS ESKIZ] Exception sending SMS: {e}")

    logger.info(f"[SMS SANDBOX] Sending to {phone}: {text}")
    return True

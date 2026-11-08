from app.workers.celery_app import celery_app
from app.core.logging import logger


@celery_app.task(name="app.workers.notification_tasks.send_sms_notification_task")
def send_sms_notification_task(phone: str, message: str) -> str:
    """Send SMS notification to user."""
    logger.info(f"Sending SMS to {phone}: {message}")
    return "SENT"


@celery_app.task(name="app.workers.notification_tasks.send_email_notification_task")
def send_email_notification_task(email: str, subject: str, content: str) -> str:
    """Send Email notification to user."""
    logger.info(f"Sending Email to {email}: {subject}")
    return "SENT"


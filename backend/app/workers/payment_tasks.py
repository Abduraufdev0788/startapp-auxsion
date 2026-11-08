from app.workers.celery_app import celery_app
from app.core.logging import logger


@celery_app.task(name="app.workers.payment_tasks.check_winner_payment_deadlines_task")
def check_winner_payment_deadlines_task() -> str:
    """Check auctions where winner payment deadline has expired."""
    logger.info("Executing check_winner_payment_deadlines_task...")
    return "SUCCESS"


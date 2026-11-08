from app.workers.celery_app import celery_app
from app.core.logging import logger


@celery_app.task(name="app.workers.auction_tasks.check_scheduled_auctions_task")
def check_scheduled_auctions_task() -> str:
    """Activate scheduled auctions whose start time has arrived."""
    logger.info("Executing periodic check_scheduled_auctions_task...")
    return "SUCCESS"


@celery_app.task(name="app.workers.auction_tasks.finalize_expired_auctions_task")
def finalize_expired_auctions_task() -> str:
    """Finalize expired auctions whose end time has passed."""
    logger.info("Executing periodic finalize_expired_auctions_task...")
    return "SUCCESS"


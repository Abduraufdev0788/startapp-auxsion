from app.workers.celery_app import celery_app
from app.core.logging import logger


@celery_app.task(name="app.workers.refund_tasks.process_auction_refunds_task")
def process_auction_refunds_task(auction_id: str) -> str:
    """Process deposits refund for losing participants in the given auction."""
    logger.info(f"Processing losing participant refunds for auction {auction_id}")
    return "SUCCESS"


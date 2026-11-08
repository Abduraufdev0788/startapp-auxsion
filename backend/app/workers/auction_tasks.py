import asyncio
from datetime import datetime, timezone
from sqlalchemy import select

from app.workers.celery_app import celery_app
from app.core.logging import logger
from app.core.constants import AuctionStatus
from app.workers.db import get_worker_db
from app.modules.auctions.models import AuctionModel
from app.modules.bidding.service import BiddingService


async def _check_scheduled_auctions():
    async with get_worker_db() as db:
        now = datetime.now(timezone.utc)
        stmt = (
            select(AuctionModel)
            .where(
                AuctionModel.status == AuctionStatus.SCHEDULED.value,
                AuctionModel.start_time <= now,
            )
        )
        res = await db.execute(stmt)
        scheduled = res.scalars().all()
        for auc in scheduled:
            auc.status = AuctionStatus.ACTIVE.value
            logger.info(f"Activated scheduled auction {auc.id}")
        await db.commit()


async def _finalize_expired_auctions():
    async with get_worker_db() as db:
        now = datetime.now(timezone.utc)
        stmt = (
            select(AuctionModel.id)
            .where(
                AuctionModel.status == AuctionStatus.ACTIVE.value,
                AuctionModel.end_time <= now,
            )
        )
        res = await db.execute(stmt)
        expired_ids = res.scalars().all()
        for auc_id in expired_ids:
            service = BiddingService(db)
            await service.finalize_auction(auc_id)
            logger.info(f"Finalized expired auction {auc_id}")


@celery_app.task(name="app.workers.auction_tasks.check_scheduled_auctions_task")
def check_scheduled_auctions_task() -> str:
    """Activate scheduled auctions whose start time has arrived."""
    logger.info("Executing periodic check_scheduled_auctions_task...")
    try:
        asyncio.run(_check_scheduled_auctions())
    except Exception as e:
        logger.error(f"Error checking scheduled auctions: {e}")
        return f"ERROR: {e}"
    return "SUCCESS"


@celery_app.task(name="app.workers.auction_tasks.finalize_expired_auctions_task")
def finalize_expired_auctions_task() -> str:
    """Finalize expired auctions whose end time has passed."""
    logger.info("Executing periodic finalize_expired_auctions_task...")
    try:
        asyncio.run(_finalize_expired_auctions())
    except Exception as e:
        logger.error(f"Error finalizing expired auctions: {e}")
        return f"ERROR: {e}"
    return "SUCCESS"

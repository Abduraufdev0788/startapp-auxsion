import asyncio
import uuid
from sqlalchemy import select

from app.workers.celery_app import celery_app
from app.core.logging import logger
from app.core.constants import DepositStatus
from app.database.session import AsyncSessionLocal
from app.modules.auctions.models import AuctionModel
from app.modules.deposits.models import DepositModel
from app.modules.refunds.service import RefundService


async def _process_auction_refunds(auction_id_str: str):
    auc_id = uuid.UUID(auction_id_str)
    async with AsyncSessionLocal() as db:
        auction = await db.get(AuctionModel, auc_id)
        if not auction:
            logger.warning(f"Auction {auction_id_str} not found for refunds")
            return

        winner_id = auction.highest_bidder_id
        # Find all deposits for this auction that belong to non-winners and are LOCKED/PAID
        stmt = (
            select(DepositModel)
            .where(
                DepositModel.auction_id == auc_id,
                DepositModel.status.in_([DepositStatus.LOCKED.value, DepositStatus.PAID.value]),
            )
        )
        if winner_id:
            stmt = stmt.where(DepositModel.user_id != winner_id)

        res = await db.execute(stmt)
        deposits = res.scalars().all()

        service = RefundService(db)
        for dep in deposits:
            idem_key = f"refund_auc_{auc_id}_{dep.id}"
            await service.process_refund(
                deposit_id=dep.id,
                idempotency_key=idem_key,
                reason=f"Auction {auc_id} ended. Returning participation deposit.",
            )
            logger.info(f"Processed refund for deposit {dep.id} in auction {auc_id}")


@celery_app.task(name="app.workers.refund_tasks.process_auction_refunds_task")
def process_auction_refunds_task(auction_id: str) -> str:
    """Process deposits refund for losing participants in the given auction."""
    logger.info(f"Processing losing participant refunds for auction {auction_id}")
    try:
        asyncio.run(_process_auction_refunds(auction_id))
    except Exception as e:
        logger.error(f"Error processing refunds for auction {auction_id}: {e}")
        return f"ERROR: {e}"
    return "SUCCESS"

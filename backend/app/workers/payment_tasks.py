import asyncio
from datetime import datetime, timezone
from sqlalchemy import select

from app.workers.celery_app import celery_app
from app.core.logging import logger
from app.core.constants import DepositStatus
from app.database.session import AsyncSessionLocal
from app.modules.auctions.models import AuctionResultModel
from app.modules.deposits.models import DepositModel
from app.modules.escrow.service import LedgerService


async def _check_winner_payment_deadlines():
    async with AsyncSessionLocal() as db:
        now = datetime.now(timezone.utc)
        stmt = (
            select(AuctionResultModel)
            .where(
                AuctionResultModel.payment_status == "PENDING",
                AuctionResultModel.payment_deadline <= now,
            )
        )
        res = await db.execute(stmt)
        expired_results = res.scalars().all()
        ledger_service = LedgerService(db)

        for result in expired_results:
            result.payment_status = "EXPIRED"
            logger.info(f"Winner payment deadline expired for auction result {result.id}")

            # Forfeit winner deposit
            if result.winner_id:
                dep_stmt = (
                    select(DepositModel)
                    .where(
                        DepositModel.auction_id == result.auction_id,
                        DepositModel.user_id == result.winner_id,
                        DepositModel.status.in_([DepositStatus.LOCKED.value, DepositStatus.PAID.value]),
                    )
                )
                dep_res = await db.execute(dep_stmt)
                deposit = dep_res.scalar_one_or_none()
                if deposit:
                    deposit.status = DepositStatus.FORFEITED.value
                    # Record double-entry ledger forfeiture
                    await ledger_service.record_transaction(
                        from_user_id=result.winner_id,
                        to_user_id=None,
                        amount_tiyin=deposit.amount,
                        reference_id=deposit.id,
                        transaction_type="DEPOSIT_FORFEITURE",
                    )
                    logger.info(f"Forfeited deposit {deposit.id} for non-paying winner {result.winner_id}")

        await db.commit()


@celery_app.task(name="app.workers.payment_tasks.check_winner_payment_deadlines_task")
def check_winner_payment_deadlines_task() -> str:
    """Check auctions where winner payment deadline has expired."""
    logger.info("Executing check_winner_payment_deadlines_task...")
    try:
        asyncio.run(_check_winner_payment_deadlines())
    except Exception as e:
        logger.error(f"Error checking winner payment deadlines: {e}")
        return f"ERROR: {e}"
    return "SUCCESS"

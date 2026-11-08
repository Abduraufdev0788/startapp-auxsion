import uuid
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import DepositStatus
from app.modules.deposits.models import DepositModel


class DepositRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user_and_auction(
        self, user_id: uuid.UUID, auction_id: uuid.UUID
    ) -> Optional[DepositModel]:
        stmt = select(DepositModel).where(
            DepositModel.user_id == user_id,
            DepositModel.auction_id == auction_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_deposit(
        self,
        user_id: uuid.UUID,
        auction_id: uuid.UUID,
        amount: int,
        status: str = DepositStatus.LOCKED.value,
        provider_ref: Optional[str] = None,
    ) -> DepositModel:
        deposit = DepositModel(
            user_id=user_id,
            auction_id=auction_id,
            amount=amount,
            status=status,
            provider_ref=provider_ref,
        )
        self.db.add(deposit)
        await self.db.flush()
        return deposit

    async def update_status(self, deposit: DepositModel, new_status: str) -> None:
        deposit.status = new_status
        await self.db.flush()

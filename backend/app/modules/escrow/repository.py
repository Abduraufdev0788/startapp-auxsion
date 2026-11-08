import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import Currency
from app.modules.escrow.models import (
    EscrowTransactionModel,
    FinancialAccountModel,
    LedgerEntryModel,
)


class EscrowRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_account(
        self, account_type: str, user_id: Optional[uuid.UUID] = None
    ) -> FinancialAccountModel:
        stmt = select(FinancialAccountModel).where(
            FinancialAccountModel.account_type == account_type,
            FinancialAccountModel.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        account = result.scalar_one_or_none()
        if not account:
            account = FinancialAccountModel(
                user_id=user_id,
                account_type=account_type,
                balance=0,
                currency=Currency.UZS.value,
            )
            self.db.add(account)
            await self.db.flush()
        return account

    async def record_ledger_entry(
        self,
        transaction_id: uuid.UUID,
        account_id: uuid.UUID,
        debit_amount: int,
        credit_amount: int,
        description: str,
    ) -> LedgerEntryModel:
        entry = LedgerEntryModel(
            transaction_id=transaction_id,
            account_id=account_id,
            debit_amount=debit_amount,
            credit_amount=credit_amount,
            currency=Currency.UZS.value,
            description=description,
        )
        self.db.add(entry)

        # Update account balance: balance = balance + credit - debit
        stmt = select(FinancialAccountModel).where(FinancialAccountModel.id == account_id).with_for_update()
        res = await self.db.execute(stmt)
        account = res.scalar_one()
        account.balance = account.balance + credit_amount - debit_amount

        await self.db.flush()
        return entry

    async def create_escrow_transaction(
        self,
        auction_id: uuid.UUID,
        buyer_id: uuid.UUID,
        seller_id: uuid.UUID,
        amount: int,
    ) -> EscrowTransactionModel:
        escrow = EscrowTransactionModel(
            auction_id=auction_id,
            buyer_id=buyer_id,
            seller_id=seller_id,
            amount=amount,
            status="HELD",
        )
        self.db.add(escrow)
        await self.db.flush()
        return escrow

    async def get_escrow_by_auction(
        self, auction_id: uuid.UUID
    ) -> Optional[EscrowTransactionModel]:
        stmt = select(EscrowTransactionModel).where(
            EscrowTransactionModel.auction_id == auction_id
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_ledger_entries(
        self, transaction_id: uuid.UUID
    ) -> List[LedgerEntryModel]:
        stmt = select(LedgerEntryModel).where(
            LedgerEntryModel.transaction_id == transaction_id
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

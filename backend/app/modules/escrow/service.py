import uuid
from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.escrow.models import LedgerEntryModel
from app.modules.escrow.repository import EscrowRepository


class LedgerService:
    """Manages immutable double-entry financial bookkeeping for AuctionHub."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EscrowRepository(db)

    async def record_transfer(
        self,
        transaction_id: uuid.UUID,
        from_account_type: str,
        to_account_type: str,
        amount_tiyin: int,
        description: str,
        from_user_id: Optional[uuid.UUID] = None,
        to_user_id: Optional[uuid.UUID] = None,
    ) -> Tuple[LedgerEntryModel, LedgerEntryModel]:
        """Record an immutable, perfectly balanced double-entry ledger transfer.

        Debit from_account (funds leave), Credit to_account (funds enter).
        sum(debit) == sum(credit) == amount_tiyin.
        """
        assert amount_tiyin > 0, "Ledger transfer amount must be greater than zero"

        # 1. Source Account (Debit: balance decreases)
        from_acc = await self.repo.get_or_create_account(
            account_type=from_account_type, user_id=from_user_id
        )
        debit_entry = await self.repo.record_ledger_entry(
            transaction_id=transaction_id,
            account_id=from_acc.id,
            debit_amount=amount_tiyin,
            credit_amount=0,
            description=f"[DEBIT] {description}",
        )

        # 2. Destination Account (Credit: balance increases)
        to_acc = await self.repo.get_or_create_account(
            account_type=to_account_type, user_id=to_user_id
        )
        credit_entry = await self.repo.record_ledger_entry(
            transaction_id=transaction_id,
            account_id=to_acc.id,
            debit_amount=0,
            credit_amount=amount_tiyin,
            description=f"[CREDIT] {description}",
        )

        return debit_entry, credit_entry

    async def list_transaction_entries(
        self, transaction_id: uuid.UUID
    ) -> List[LedgerEntryModel]:
        return await self.repo.list_ledger_entries(transaction_id)

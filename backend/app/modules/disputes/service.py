import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.auctions.repository import AuctionRepository
from app.modules.disputes.models import DisputeModel
from app.modules.disputes.repository import DisputeRepository
from app.modules.disputes.schemas import DisputeCreateRequest, DisputeResolveRequest


class DisputeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DisputeRepository(db)
        self.auction_repo = AuctionRepository(db)

    async def create_dispute(
        self, user_id: uuid.UUID, data: DisputeCreateRequest
    ) -> DisputeModel:
        auction = await self.auction_repo.get_by_id(data.auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        # Create dispute
        dispute = await self.repo.create_dispute(
            auction_id=data.auction_id,
            raised_by_id=user_id,
            reason=data.reason,
            description=data.description,
        )
        await self.db.commit()
        return dispute

    async def list_my_disputes(self, user_id: uuid.UUID) -> List[DisputeModel]:
        return await self.repo.list_by_user(user_id)

    async def resolve_dispute(
        self, dispute_id: uuid.UUID, admin_id: uuid.UUID, data: DisputeResolveRequest
    ) -> DisputeModel:
        dispute = await self.repo.get_by_id(dispute_id)
        if not dispute:
            raise NotFoundException("Nizo topilmadi", error_code="DISPUTE_NOT_FOUND")

        resolved = await self.repo.resolve(
            dispute=dispute,
            resolution=data.resolution,
            notes=data.notes,
        )
        await self.db.commit()
        return resolved

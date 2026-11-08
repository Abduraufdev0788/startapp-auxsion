import uuid
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.deliveries.models import DeliveryModel


class DeliveryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_auction_id(self, auction_id: uuid.UUID) -> Optional[DeliveryModel]:
        stmt = select(DeliveryModel).where(DeliveryModel.auction_id == auction_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id(self, delivery_id: uuid.UUID) -> Optional[DeliveryModel]:
        stmt = select(DeliveryModel).where(DeliveryModel.id == delivery_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create_delivery(
        self,
        auction_id: uuid.UUID,
        buyer_id: uuid.UUID,
        seller_id: uuid.UUID,
        shipping_address: str,
    ) -> DeliveryModel:
        delivery = DeliveryModel(
            auction_id=auction_id,
            buyer_id=buyer_id,
            seller_id=seller_id,
            shipping_address=shipping_address,
            status="PENDING",
        )
        self.db.add(delivery)
        await self.db.flush()
        return delivery

    async def mark_shipped(
        self,
        delivery: DeliveryModel,
        tracking_number: str,
        carrier: str,
    ) -> DeliveryModel:
        delivery.tracking_number = tracking_number
        delivery.carrier = carrier
        delivery.status = "SHIPPED"
        await self.db.flush()
        return delivery

    async def mark_delivered_and_confirmed(self, delivery: DeliveryModel) -> DeliveryModel:
        delivery.status = "CONFIRMED"
        delivery.delivered_at = datetime.now(timezone.utc)
        await self.db.flush()
        return delivery

    async def list_by_user(self, user_id: uuid.UUID) -> List[DeliveryModel]:
        stmt = select(DeliveryModel).where(
            (DeliveryModel.buyer_id == user_id) | (DeliveryModel.seller_id == user_id)
        ).order_by(DeliveryModel.created_at.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

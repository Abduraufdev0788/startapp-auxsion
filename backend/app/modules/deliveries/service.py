import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ConflictException,
    ForbiddenException,
    NotFoundException,
)
from app.modules.auctions.repository import AuctionRepository
from app.modules.deliveries.models import DeliveryModel
from app.modules.deliveries.repository import DeliveryRepository
from app.modules.deliveries.schemas import (
    CreateDeliveryAddressRequest,
    UpdateShippingTrackingRequest,
)
from app.modules.escrow.service import LedgerService
from app.modules.notifications.service import NotificationService
from app.modules.settlements.models import SellerSettlementModel


class DeliveryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DeliveryRepository(db)
        self.auction_repo = AuctionRepository(db)
        self.ledger_service = LedgerService(db)
        self.notification_service = NotificationService(db)

    async def submit_delivery_address(
        self, auction_id: uuid.UUID, buyer_id: uuid.UUID, data: CreateDeliveryAddressRequest
    ) -> DeliveryModel:
        auction = await self.auction_repo.get_by_id(auction_id)
        if not auction:
            raise NotFoundException("Auksion topilmadi", error_code="AUCTION_NOT_FOUND")

        if not auction.result or auction.result.winner_id != buyer_id:
            raise ForbiddenException("Faqat auksion g'olibi yetkazib berish manzilini kirita oladi")

        if auction.result.payment_status != "COMPLETED":
            raise ConflictException(
                "Yetkazib berish uchun auksion to'lovi to'liq yakunlangan bo'lishi shart",
                error_code="PAYMENT_NOT_SETTLED",
            )

        existing = await self.repo.get_by_auction_id(auction_id)
        if existing:
            existing.shipping_address = data.shipping_address
            await self.db.commit()
            return existing

        delivery = await self.repo.create_delivery(
            auction_id=auction_id,
            buyer_id=buyer_id,
            seller_id=auction.seller_id,
            shipping_address=data.shipping_address,
        )

        # Notify seller that buyer submitted delivery address
        await self.notification_service.notify_user(
            user_id=auction.seller_id,
            title="Yetkazib berish manzili kiritildi",
            message=f"Xaridor '{auction.product.title}' auksioni uchun yetkazib berish manzilini taqdim etdi.",
            type="DELIVERY",
            link=f"/deliveries/{delivery.id}",
        )

        await self.db.commit()
        return delivery

    async def ship_order(
        self,
        delivery_id: uuid.UUID,
        seller_id: uuid.UUID,
        data: UpdateShippingTrackingRequest,
    ) -> DeliveryModel:
        delivery = await self.repo.get_by_id(delivery_id)
        if not delivery:
            raise NotFoundException("Yetkazib berish yozuvi topilmadi", error_code="DELIVERY_NOT_FOUND")

        if delivery.seller_id != seller_id:
            raise ForbiddenException("Faqat sotuvchi jo'natma ma'lumotlarini kirita oladi")

        updated = await self.repo.mark_shipped(
            delivery=delivery,
            tracking_number=data.tracking_number,
            carrier=data.carrier,
        )

        # Notify buyer that order has shipped with tracking number
        await self.notification_service.notify_user(
            user_id=delivery.buyer_id,
            title="Buyurtmangiz jo'natildi!",
            message=f"Siz yutib olgan mahsulot {data.carrier} orqali jo'natildi. Kuzatuv kodi: {data.tracking_number}",
            type="SHIPPED",
            link=f"/deliveries/{delivery.id}",
        )

        await self.db.commit()
        return updated

    async def confirm_delivery_receipt(
        self, delivery_id: uuid.UUID, buyer_id: uuid.UUID
    ) -> DeliveryModel:
        """Buyer confirms successful product receipt -> release escrow payout to seller."""
        delivery = await self.repo.get_by_id(delivery_id)
        if not delivery:
            raise NotFoundException("Yetkazib berish yozuvi topilmadi", error_code="DELIVERY_NOT_FOUND")

        if delivery.buyer_id != buyer_id:
            raise ForbiddenException("Faqat xaridor qabul qilib olganini tasdiqlay oladi")

        if delivery.status == "CONFIRMED":
            return delivery

        confirmed = await self.repo.mark_delivered_and_confirmed(delivery)

        # Escrow release to Seller Settlement
        auction = await self.auction_repo.get_by_id(delivery.auction_id)
        assert auction is not None and auction.result is not None
        gross_amount = auction.result.winning_bid or 0
        platform_fee = int(gross_amount * 0.03)  # 3% platform commission
        net_payout = gross_amount - platform_fee

        settlement_id = uuid.uuid4()
        settlement = SellerSettlementModel(
            id=settlement_id,
            seller_id=delivery.seller_id,
            auction_id=delivery.auction_id,
            gross_amount=gross_amount,
            platform_fee=platform_fee,
            net_payout=net_payout,
            status="PAID",
            payout_reference=f"settle_{uuid.uuid4().hex[:10]}",
        )
        self.db.add(settlement)
        await self.db.flush()

        # Double-entry ledger transfer from PLATFORM_ESCROW to SELLER_SETTLEMENT
        await self.ledger_service.record_transfer(
            transaction_id=settlement_id,
            from_account_type="PLATFORM_ESCROW",
            to_account_type="SELLER_SETTLEMENT",
            amount_tiyin=net_payout,
            description=f"Seller payout for delivered auction {auction.id}",
            to_user_id=delivery.seller_id,
        )

        # Notify seller of successful payout release
        await self.notification_service.notify_user(
            user_id=delivery.seller_id,
            title="Yetkazib berish tasdiqlandi va to'lov o'tkazildi!",
            message=f"Xaridor buyumni qabul qildi. Mablag' hisobingizga o'tkazildi.",
            type="SETTLEMENT",
        )

        await self.db.commit()
        return confirmed

    async def list_my_deliveries(self, user_id: uuid.UUID) -> List[DeliveryModel]:
        return await self.repo.list_by_user(user_id)

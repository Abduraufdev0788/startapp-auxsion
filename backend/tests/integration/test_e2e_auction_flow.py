import uuid
from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.bidding.service import BiddingService


@pytest.mark.asyncio
async def test_complete_end_to_end_auction_marketplace_flow(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Comprehensive E2E test verifying the entire auction marketplace lifecycle:
    Seller creates lot -> Buyer pays deposit -> Bidding -> Auction completion ->
    Winner settlement -> Delivery logistics -> Escrow payout confirmation.
    """
    # 1. Register and authenticate Seller
    seller_reg = await client.post(
        "/api/v1/auth/register",
        json={
            "phone": "+998901110001",
            "password": "SecurePassword123!",
            "full_name": "Sotuvchi Kompaniya",
            "email": "seller_e2e@auctionhub.uz",
        },
    )
    assert seller_reg.status_code == 201
    seller_token = seller_reg.json()["access_token"]
    seller_headers = {"Authorization": f"Bearer {seller_token}"}

    # 2. Register and authenticate Buyer
    buyer_reg = await client.post(
        "/api/v1/auth/register",
        json={
            "phone": "+998902220002",
            "password": "SecurePassword123!",
            "full_name": "Xaridor Jasur",
            "email": "buyer_e2e@auctionhub.uz",
        },
    )
    assert buyer_reg.status_code == 201
    buyer_token = buyer_reg.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    # 3. Create Category directly in DB and Product as Seller
    from app.modules.categories.repository import CategoryRepository
    from app.modules.categories.schemas import CategoryCreateRequest

    cat_repo = CategoryRepository(db_session)
    category = await cat_repo.create(
        CategoryCreateRequest(name="Smartfonlar E2E", slug=f"smartphones-e2e-{uuid.uuid4().hex[:6]}", display_order=1)
    )
    await db_session.commit()
    category_id = str(category.id)

    prod_res = await client.post(
        "/api/v1/products",
        headers=seller_headers,
        json={
            "title": "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
            "description": "Original yangi ochilmagan qadoqda, 1 yil rasmiy kafolat bilan.",
            "category_id": category_id,
            "condition": "NEW",
        },
    )
    assert prod_res.status_code == 201
    product_id = prod_res.json()["id"]

    # 4. Create Auction (10 mln UZS start, 12 mln reserve, 100 ming increment, 500 ming deposit)
    now = datetime.now(timezone.utc)
    auc_res = await client.post(
        "/api/v1/auctions",
        headers=seller_headers,
        json={
            "product_id": product_id,
            "starting_price_uzs": 10000000,
            "reserve_price_uzs": 12000000,
            "min_bid_increment_uzs": 100000,
            "deposit_amount_uzs": 500000,
            "start_time": (now - timedelta(minutes=5)).isoformat(),
            "end_time": (now + timedelta(hours=2)).isoformat(),
            "delivery_info": "Toshkent shahri bo'ylab bepul yetkazib berish",
        },
    )
    assert auc_res.status_code == 201
    auction_id = auc_res.json()["id"]

    # 5. Publish Auction to Marketplace
    pub_res = await client.post(
        f"/api/v1/auctions/{auction_id}/publish",
        headers=seller_headers,
    )
    assert pub_res.status_code == 200
    assert pub_res.json()["status"] == "ACTIVE"

    # 6. Buyer checks participation eligibility before deposit
    elig_before = await client.get(
        f"/api/v1/auctions/{auction_id}/participation",
        headers=buyer_headers,
    )
    assert elig_before.status_code == 200
    assert elig_before.json()["is_eligible"] is False

    # 7. Buyer pays refundable participation deposit
    part_res = await client.post(
        f"/api/v1/auctions/{auction_id}/participate",
        headers=buyer_headers,
    )
    assert part_res.status_code == 201
    assert part_res.json()["status"] == "ELIGIBLE"

    # 8. Buyer submits a bid meeting reserve price (13 mln UZS >= 12 mln reserve)
    bid_res = await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        headers=buyer_headers,
        json={"amount_uzs": 13000000},
    )
    assert bid_res.status_code == 201
    assert bid_res.json()["amount"] == 1300000000  # 13 mln * 100 tiyin

    # 9. Server finalizes auction
    bidding_service = BiddingService(db_session)
    await bidding_service.finalize_auction(uuid.UUID(auction_id))

    # Verify auction status is COMPLETED
    auc_detail = await client.get(f"/api/v1/auctions/{auction_id}")
    assert auc_detail.status_code == 200
    assert auc_detail.json()["status"] == "COMPLETED"

    # 10. Winner settles remaining payment balance (13 mln - 500k deposit = 12.5 mln UZS)
    settle_res = await client.post(
        "/api/v1/payments/winner-settle",
        headers=buyer_headers,
        json={"auction_id": auction_id},
    )
    assert settle_res.status_code == 200
    assert settle_res.json()["status"] == "COMPLETED"
    assert settle_res.json()["settled_amount"] == 1250000000  # 12.5 mln UZS in tiyin

    # 11. Winner provides delivery address
    deliv_res = await client.post(
        f"/api/v1/deliveries/auctions/{auction_id}",
        headers=buyer_headers,
        json={"shipping_address": "Toshkent shahri, Chilonzor 9-mavze, 14-uy, 22-xonadon"},
    )
    assert deliv_res.status_code == 201
    delivery_id = deliv_res.json()["id"]
    assert deliv_res.json()["status"] == "PENDING"

    # 12. Seller marks package shipped with tracking number & carrier
    ship_res = await client.patch(
        f"/api/v1/deliveries/{delivery_id}/ship",
        headers=seller_headers,
        json={"tracking_number": "UZPOST-99887766", "carrier": "UzPost Express"},
    )
    assert ship_res.status_code == 200
    assert ship_res.json()["status"] == "SHIPPED"
    assert ship_res.json()["tracking_number"] == "UZPOST-99887766"

    # 13. Buyer confirms receipt -> triggers escrow release to seller settlement
    confirm_res = await client.post(
        f"/api/v1/deliveries/{delivery_id}/confirm",
        headers=buyer_headers,
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "CONFIRMED"

    # 14. Verify buyer received completion notification
    notifs_res = await client.get("/api/v1/notifications", headers=buyer_headers)
    assert notifs_res.status_code == 200
    assert len(notifs_res.json()) >= 1

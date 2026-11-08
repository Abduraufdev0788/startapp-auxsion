import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest
from app.modules.notifications.service import NotificationService


@pytest.mark.asyncio
async def test_notifications_workflow(client: AsyncClient, db_session):
    # Register user
    res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998909876543", "password": "Password123", "full_name": "Notif User"},
    )
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create notifications via service
    user_me = await client.get("/api/v1/auth/me", headers=headers)
    user_id = uuid.UUID(user_me.json()["id"])

    notif_service = NotificationService(db_session)
    n1 = await notif_service.notify_user(
        user_id=user_id,
        title="Yangi narx taklifi",
        message="Sizning lotingizga 15 000 000 UZS taklif berildi",
    )
    n2 = await notif_service.notify_user(
        user_id=user_id,
        title="Auksion yakunlandi",
        message="Tabriklaymiz, siz g'olib bo'ldingiz!",
    )

    # 1. Check unread count
    cnt_res = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert cnt_res.status_code == 200
    assert cnt_res.json()["unread_count"] == 2

    # 2. List notifications
    list_res = await client.get("/api/v1/notifications", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 2

    # 3. Mark one read
    read_res = await client.patch(f"/api/v1/notifications/{n1.id}/read", headers=headers)
    assert read_res.status_code == 200
    assert read_res.json()["is_read"] is True

    # 4. Check unread count is now 1
    cnt_res2 = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert cnt_res2.json()["unread_count"] == 1

    # 5. Mark all read
    all_read = await client.post("/api/v1/notifications/read-all", headers=headers)
    assert all_read.status_code == 200

    cnt_res3 = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert cnt_res3.json()["unread_count"] == 0


@pytest.mark.asyncio
async def test_delivery_and_settlement_workflow(client: AsyncClient, db_session):
    cat_repo = CategoryRepository(db_session)
    category = await cat_repo.create(
        CategoryCreateRequest(name="Delivery Test", slug="delivery-test", display_order=1)
    )
    await db_session.commit()

    # Register Seller
    s_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998906665544", "password": "Password123", "full_name": "Sotuvchi Logistika"},
    )
    s_token = s_res.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}

    # Register Buyer Winner
    b_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998906667788", "password": "Password123", "full_name": "Xaridor Yetkazish"},
    )
    b_token = b_res.json()["access_token"]
    b_headers = {"Authorization": f"Bearer {b_token}"}

    # Create Product & Auction
    p_res = await client.post(
        "/api/v1/products",
        json={
            "title": "Kamera Sony A7 IV",
            "description": "Professional kamera body",
            "category_id": str(category.id),
            "condition": "NEW",
        },
        headers=s_headers,
    )
    product_id = p_res.json()["id"]

    now = datetime.now(timezone.utc)
    auc_res = await client.post(
        "/api/v1/auctions",
        json={
            "product_id": product_id,
            "starting_price_uzs": 25000000,
            "reserve_price_uzs": 25000000,
            "min_bid_increment_uzs": 500000,
            "deposit_amount_uzs": 1000000,
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(days=1)).isoformat(),
        },
        headers=s_headers,
    )
    auction_id = auc_res.json()["id"]

    # Publish
    await client.post(f"/api/v1/auctions/{auction_id}/publish", headers=s_headers)

    # Buyer participates & bids
    await client.post(f"/api/v1/auctions/{auction_id}/participate", headers=b_headers)
    await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        json={"amount_uzs": 25000000},
        headers=b_headers,
    )

    # Finalize
    from app.modules.bidding.service import BiddingService
    bidding_service = BiddingService(db_session)
    await bidding_service.finalize_auction(uuid.UUID(auction_id))

    # Winner settles remaining balance
    await client.post(
        "/api/v1/payments/winner-settle",
        json={"auction_id": auction_id},
        headers=b_headers,
    )

    # 1. Winner submits delivery address
    addr_res = await client.post(
        f"/api/v1/deliveries/auctions/{auction_id}",
        json={"shipping_address": "Toshkent shahri, Chilonzor tumani, 9-mavze, 15-uy"},
        headers=b_headers,
    )
    assert addr_res.status_code == 201
    delivery_data = addr_res.json()
    assert delivery_data["status"] == "PENDING"
    delivery_id = delivery_data["id"]

    # 2. Seller inputs shipping tracking number
    ship_res = await client.patch(
        f"/api/v1/deliveries/{delivery_id}/ship",
        json={"tracking_number": "UZ123456789EX", "carrier": "Express Post Uzbekistan"},
        headers=s_headers,
    )
    assert ship_res.status_code == 200
    assert ship_res.json()["status"] == "SHIPPED"
    assert ship_res.json()["tracking_number"] == "UZ123456789EX"

    # 3. Buyer confirms delivery receipt -> releases Escrow
    confirm_res = await client.post(
        f"/api/v1/deliveries/{delivery_id}/confirm",
        headers=b_headers,
    )
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "CONFIRMED"
    assert confirm_res.json()["delivered_at"] is not None

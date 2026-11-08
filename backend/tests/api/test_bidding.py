import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest
from app.modules.bidding.service import BiddingService


@pytest.mark.asyncio
async def test_bidding_engine_flow(client: AsyncClient, db_session):
    # Setup Category
    cat_repo = CategoryRepository(db_session)
    category = await cat_repo.create(
        CategoryCreateRequest(name="Elektronika Bidding", slug="elektronika-bid", display_order=1)
    )
    await db_session.commit()

    # 1. Register Seller
    seller_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998901111111", "password": "Password123", "full_name": "Sotuvchi"},
    )
    seller_token = seller_res.json()["access_token"]
    seller_headers = {"Authorization": f"Bearer {seller_token}"}

    # 2. Register Buyer 1
    b1_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998902222222", "password": "Password123", "full_name": "Xaridor 1"},
    )
    b1_token = b1_res.json()["access_token"]
    b1_headers = {"Authorization": f"Bearer {b1_token}"}

    # 3. Register Buyer 2
    b2_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998903333333", "password": "Password123", "full_name": "Xaridor 2"},
    )
    b2_token = b2_res.json()["access_token"]
    b2_headers = {"Authorization": f"Bearer {b2_token}"}

    # 4. Create Product & Auction
    prod_res = await client.post(
        "/api/v1/products",
        json={
            "title": "MacBook Pro M3 Max",
            "description": "Eng yuqori konfiguratsiya, 64GB RAM",
            "category_id": str(category.id),
            "condition": "NEW",
        },
        headers=seller_headers,
    )
    product_id = prod_res.json()["id"]

    now = datetime.now(timezone.utc)
    auc_res = await client.post(
        "/api/v1/auctions",
        json={
            "product_id": product_id,
            "starting_price_uzs": 30000000,   # 30 000 000 UZS
            "reserve_price_uzs": 35000000,    # 35 000 000 UZS
            "min_bid_increment_uzs": 500000,  # 500 000 UZS
            "deposit_amount_uzs": 1000000,    # 1 000 000 UZS
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(days=2)).isoformat(),
        },
        headers=seller_headers,
    )
    auction_id = auc_res.json()["id"]

    # 5. Publish Auction -> ACTIVE
    await client.post(f"/api/v1/auctions/{auction_id}/publish", headers=seller_headers)

    # 6. Test: Seller cannot participate in their own auction
    seller_part_res = await client.post(
        f"/api/v1/auctions/{auction_id}/participate", headers=seller_headers
    )
    assert seller_part_res.status_code == 403
    assert seller_part_res.json()["error_code"] == "SELF_BIDDING_PROHIBITED"

    # 7. Test: Buyer 1 cannot bid WITHOUT paying deposit first
    no_dep_bid = await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        json={"amount_uzs": 30500000},
        headers=b1_headers,
    )
    assert no_dep_bid.status_code == 403
    assert no_dep_bid.json()["error_code"] == "DEPOSIT_REQUIRED"

    # 8. Buyer 1 pays deposit and joins
    part_res1 = await client.post(
        f"/api/v1/auctions/{auction_id}/participate", headers=b1_headers
    )
    assert part_res1.status_code == 201
    assert part_res1.json()["status"] == "ELIGIBLE"

    # 9. Buyer 1 bids starting price (30 000 000 UZS)
    bid1_res = await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        json={"amount_uzs": 30000000},
        headers=b1_headers,
    )
    assert bid1_res.status_code == 201
    assert bid1_res.json()["amount_uzs"] == 30000000.0

    # 10. Buyer 2 joins and pays deposit
    await client.post(
        f"/api/v1/auctions/{auction_id}/participate", headers=b2_headers
    )

    # 11. Test: Buyer 2 tries to submit invalid low bid (must be >= 30.5M)
    low_bid_res = await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        json={"amount_uzs": 30200000},  # less than +500 000 UZS
        headers=b2_headers,
    )
    assert low_bid_res.status_code == 400
    assert low_bid_res.json()["error_code"] == "INVALID_BID_AMOUNT"

    # 12. Buyer 2 submits valid outbid: 36 000 000 UZS (exceeds reserve price!)
    valid_outbid = await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        json={"amount_uzs": 36000000},
        headers=b2_headers,
    )
    assert valid_outbid.status_code == 201

    # 13. Verify auction highest bid is now Buyer 2's 36 000 000 UZS
    check_auc = await client.get(f"/api/v1/auctions/{auction_id}")
    assert check_auc.status_code == 200
    auc_info = check_auc.json()
    assert auc_info["current_highest_bid"] == 3600000000  # in tiyin
    assert auc_info["bid_count"] == 2

    # 14. Test Finalization: finalize auction when reserve price is met
    bidding_service = BiddingService(db_session)
    await bidding_service.finalize_auction(uuid.UUID(auction_id))

    # Check finalized state
    final_res = await client.get(f"/api/v1/auctions/{auction_id}")
    assert final_res.json()["status"] == "COMPLETED"

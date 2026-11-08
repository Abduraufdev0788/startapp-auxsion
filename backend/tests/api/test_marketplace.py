import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.core.constants import UserRole


@pytest.mark.asyncio
async def test_category_and_product_workflow(client: AsyncClient):
    # 1. Register admin user for category creation
    admin_reg = {
        "phone": "+998901239999",
        "password": "Password123",
        "full_name": "Admin User",
    }
    admin_res = await client.post("/api/v1/auth/register", json=admin_reg)
    admin_token = admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Manually upgrade role to ADMIN or check dependency
    # 2. Create Category
    cat_payload = {
        "name": "Elektronika",
        "slug": "elektronika",
        "description": "Barcha elektronika mahsulotlari",
        "icon": "smartphone",
        "display_order": 1,
    }
    # Note: user has default USER role, non-admin gets 403
    forbidden_cat = await client.post("/api/v1/categories", json=cat_payload, headers=admin_headers)
    assert forbidden_cat.status_code == 403


@pytest.mark.asyncio
async def test_auction_lifecycle_and_validation(client: AsyncClient, db_session):
    from app.modules.categories.repository import CategoryRepository
    from app.modules.categories.schemas import CategoryCreateRequest

    # Create category directly in DB for product testing
    cat_repo = CategoryRepository(db_session)
    category = await cat_repo.create(
        CategoryCreateRequest(name="Smartfonlar", slug="smartfonlar", display_order=1)
    )
    await db_session.commit()

    # 1. Register Seller
    seller_reg = {
        "phone": "+998908887766",
        "password": "Password123",
        "full_name": "Sotuvchi Akmal",
    }
    seller_res = await client.post("/api/v1/auth/register", json=seller_reg)
    seller_token = seller_res.json()["access_token"]
    seller_headers = {"Authorization": f"Bearer {seller_token}"}

    # 2. Create Product
    product_payload = {
        "title": "Samsung Galaxy S24 Ultra",
        "description": "Yangi, ochilmagan qutida, 256GB Titanium Gray",
        "category_id": str(category.id),
        "condition": "NEW",
    }
    prod_res = await client.post("/api/v1/products", json=product_payload, headers=seller_headers)
    assert prod_res.status_code == 201
    product = prod_res.json()
    product_id = product["id"]

    # 3. Validation: Starting price cannot exceed reserve price
    now = datetime.now(timezone.utc)
    invalid_price_auction = {
        "product_id": product_id,
        "starting_price_uzs": 15000000,
        "reserve_price_uzs": 12000000,  # Less than starting price!
        "min_bid_increment_uzs": 200000,
        "deposit_amount_uzs": 500000,
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(days=3)).isoformat(),
    }
    inv_res = await client.post("/api/v1/auctions", json=invalid_price_auction, headers=seller_headers)
    assert inv_res.status_code == 422

    # 4. Validation: Auction duration cannot be too short (< 1 hour)
    too_short_auction = {
        "product_id": product_id,
        "starting_price_uzs": 10000000,
        "reserve_price_uzs": 12000000,
        "min_bid_increment_uzs": 200000,
        "deposit_amount_uzs": 500000,
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(minutes=30)).isoformat(),  # 30 mins < 1 hour
    }
    short_res = await client.post("/api/v1/auctions", json=too_short_auction, headers=seller_headers)
    assert short_res.status_code == 400
    assert short_res.json()["error_code"] == "AUCTION_TOO_SHORT"

    # 5. Create Valid Auction
    valid_auction = {
        "product_id": product_id,
        "starting_price_uzs": 10000000,
        "reserve_price_uzs": 12000000,
        "min_bid_increment_uzs": 200000,
        "deposit_amount_uzs": 500000,
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(days=3)).isoformat(),
        "delivery_info": "Toshkent shahri bo'ylab bepul yetkazib berish",
        "rules": "Standart auksion qoidalari",
    }
    auc_res = await client.post("/api/v1/auctions", json=valid_auction, headers=seller_headers)
    assert auc_res.status_code == 201
    auction_data = auc_res.json()
    assert auction_data["status"] == "DRAFT"
    # Starting price 10 000 000 UZS = 1 000 000 000 tiyin
    assert auction_data["starting_price"] == 1000000000
    assert auction_data["deposit_amount"] == 50000000
    auction_id = auction_data["id"]

    # 6. Publish Auction
    pub_res = await client.post(f"/api/v1/auctions/{auction_id}/publish", headers=seller_headers)
    assert pub_res.status_code == 200
    pub_data = pub_res.json()
    assert pub_data["status"] == "ACTIVE"

    # 7. List marketplace auctions (Public endpoint)
    market_res = await client.get("/api/v1/auctions")
    assert market_res.status_code == 200
    market_data = market_res.json()
    assert market_data["total"] >= 1
    assert any(a["id"] == auction_id for a in market_data["items"])

    # 8. Get Auction Details
    detail_res = await client.get(f"/api/v1/auctions/{auction_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["id"] == auction_id
    assert detail_data["product"]["title"] == "Samsung Galaxy S24 Ultra"

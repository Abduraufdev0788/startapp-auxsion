import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest


@pytest.mark.asyncio
async def test_favorite_flow(client: AsyncClient, db_session):
    # 1. Setup category
    cat_repo = CategoryRepository(db_session)
    cat = await cat_repo.create(
        CategoryCreateRequest(name="Fav Test Cat", slug="fav-test-cat", display_order=1)
    )
    await db_session.commit()

    # 2. Register Seller & create auction
    s_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998901239988", "password": "Password123", "full_name": "Fav Seller"},
    )
    s_headers = {"Authorization": f"Bearer {s_res.json()['access_token']}"}

    p_res = await client.post(
        "/api/v1/products",
        json={
            "title": "Favorite Test Product",
            "description": "Product for favorite testing",
            "category_id": str(cat.id),
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
            "starting_price_uzs": 10000000,
            "reserve_price_uzs": 12000000,
            "min_bid_increment_uzs": 200000,
            "deposit_amount_uzs": 500000,
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(days=2)).isoformat(),
        },
        headers=s_headers,
    )
    auction_id = auc_res.json()["id"]
    await client.post(f"/api/v1/auctions/{auction_id}/publish", headers=s_headers)

    # 3. Register Buyer
    b_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998901237766", "password": "Password123", "full_name": "Fav Buyer"},
    )
    b_headers = {"Authorization": f"Bearer {b_res.json()['access_token']}"}

    # 4. Check initial status (should be false)
    res = await client.get(
        f"/api/v1/favorites/{auction_id}/status",
        headers=b_headers,
    )
    assert res.status_code == 200
    assert res.json()["is_favorite"] is False

    # 5. Toggle favorite (add)
    res = await client.post(
        f"/api/v1/favorites/{auction_id}/toggle",
        headers=b_headers,
    )
    assert res.status_code == 200
    assert res.json()["is_favorite"] is True

    # 6. Verify in user's favorites list
    res = await client.get("/api/v1/favorites", headers=b_headers)
    assert res.status_code == 200
    fav_list = res.json()
    assert len(fav_list) == 1
    assert fav_list[0]["id"] == auction_id

    # 7. Check IDs endpoint
    res = await client.get("/api/v1/favorites/ids", headers=b_headers)
    assert res.status_code == 200
    assert auction_id in res.json()

    # 8. Toggle favorite again (remove)
    res = await client.post(
        f"/api/v1/favorites/{auction_id}/toggle",
        headers=b_headers,
    )
    assert res.status_code == 200
    assert res.json()["is_favorite"] is False

    # 9. Verify removed from list
    res = await client.get("/api/v1/favorites", headers=b_headers)
    assert res.status_code == 200
    assert len(res.json()) == 0

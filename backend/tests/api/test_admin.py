import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.core.constants import UserRole
from app.modules.auth.models import RoleModel, UserRoleModel
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest
from app.modules.users.models import UserModel


@pytest.mark.asyncio
async def test_admin_rbac_and_moderation_workflow(client: AsyncClient, db_session):
    # 1. Register Regular User
    reg_user_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998901112244", "password": "Password123", "full_name": "Oddiy Foydalanuvchi"},
    )
    user_token = reg_user_res.json()["access_token"]
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Test: Regular user blocked from admin endpoints
    forbidden_res = await client.get("/api/v1/admin/dashboard", headers=user_headers)
    assert forbidden_res.status_code == 403
    assert forbidden_res.json()["error_code"] == "INSUFFICIENT_PERMISSIONS"

    # 2. Register Admin User and assign ADMIN role
    reg_admin_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998909990011", "password": "Password123", "full_name": "Bosh Admin"},
    )
    admin_token = reg_admin_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Grant ADMIN role directly in test DB
    admin_me = await client.get("/api/v1/auth/me", headers=admin_headers)
    admin_id = uuid.UUID(admin_me.json()["id"])

    admin_role = RoleModel(name=UserRole.ADMIN.value, description="Admin")
    db_session.add(admin_role)
    await db_session.flush()

    user_role = UserRoleModel(user_id=admin_id, role_id=admin_role.id)
    db_session.add(user_role)
    await db_session.commit()

    # 3. Admin can now access /admin/dashboard
    dash_res = await client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert dash_res.status_code == 200
    metrics = dash_res.json()
    assert "total_users" in metrics
    assert "active_auctions" in metrics

    # 4. Create Category, Product and Draft Auction for moderation test
    cat_repo = CategoryRepository(db_session)
    category = await cat_repo.create(
        CategoryCreateRequest(name="Admin Moderation Cat", slug="admin-mod-cat", display_order=1)
    )
    await db_session.commit()

    prod_res = await client.post(
        "/api/v1/products",
        json={
            "title": "Noyob Antik Buyum",
            "description": "19-asrga oid qadimiy qo'lyozma",
            "category_id": str(category.id),
            "condition": "USED",
        },
        headers=user_headers,
    )
    product_id = prod_res.json()["id"]

    now = datetime.now(timezone.utc)
    auc_res = await client.post(
        "/api/v1/auctions",
        json={
            "product_id": product_id,
            "starting_price_uzs": 5000000,
            "reserve_price_uzs": 8000000,
            "min_bid_increment_uzs": 200000,
            "deposit_amount_uzs": 500000,
            "start_time": (now + timedelta(hours=2)).isoformat(),
            "end_time": (now + timedelta(days=5)).isoformat(),
        },
        headers=user_headers,
    )
    auction_id = auc_res.json()["id"]

    # 5. Admin Moderates Auction: APPROVE
    mod_res = await client.post(
        f"/api/v1/admin/auctions/{auction_id}/moderate",
        json={"decision": "APPROVED", "reason": "Barcha hujjatlar tekshirildi va tasdiqlandi"},
        headers=admin_headers,
    )
    assert mod_res.status_code == 200
    assert mod_res.json()["status"] == "SCHEDULED"

    # 6. Admin can view immutable Audit Logs
    audit_res = await client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) >= 1
    assert any("AUCTION_MODERATION_APPROVED" in l["action"] for l in logs)

    # 7. Dispute Workflow Test
    disp_res = await client.post(
        "/api/v1/disputes",
        json={
            "auction_id": auction_id,
            "reason": "Tavsifdagi noaniqlik",
            "description": "Mahsulot holati bo'yicha qo'shimcha ekspertiza xulosasi talab qilinadi",
        },
        headers=user_headers,
    )
    assert disp_res.status_code == 201
    dispute_id = disp_res.json()["id"]

    # Admin resolves dispute
    res_disp = await client.post(
        f"/api/v1/admin/disputes/{dispute_id}/resolve",
        json={
            "resolution": "RESOLVED_BUYER_FAVOR",
            "notes": "Ekspertiza xulosasiga binoan e'tiroz qanoatlantirildi",
        },
        headers=admin_headers,
    )
    assert res_disp.status_code == 200
    assert res_disp.json()["status"] == "RESOLVED_BUYER_FAVOR"

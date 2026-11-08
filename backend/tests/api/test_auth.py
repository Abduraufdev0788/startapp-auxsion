import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    payload = {
        "phone": "+998901234567",
        "password": "Password123",
        "full_name": "Alisher Navoiy",
        "email": "alisher@example.com",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate_phone_conflict(client: AsyncClient):
    payload = {
        "phone": "+998901234568",
        "password": "Password123",
        "full_name": "Test User",
    }
    res1 = await client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Second attempt with same phone
    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert res2.json()["error_code"] == "PHONE_EXISTS"


@pytest.mark.asyncio
async def test_register_weak_password_rejected(client: AsyncClient):
    payload = {
        "phone": "+998901234569",
        "password": "123",  # too short
        "full_name": "Short Pass User",
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422 or response.status_code == 400


@pytest.mark.asyncio
async def test_login_success_and_failure(client: AsyncClient):
    # Register user first
    reg_payload = {
        "phone": "+998909998877",
        "password": "SecurePassword1",
        "full_name": "Bobur Mirzo",
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    # Login with correct password
    login_payload = {
        "phone": "+998909998877",
        "password": "SecurePassword1",
    }
    res_success = await client.post("/api/v1/auth/login", json=login_payload)
    assert res_success.status_code == 200
    assert "access_token" in res_success.json()

    # Login with wrong password
    bad_login = {
        "phone": "+998909998877",
        "password": "WrongPassword99",
    }
    res_fail = await client.post("/api/v1/auth/login", json=bad_login)
    assert res_fail.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_revocation(client: AsyncClient):
    reg_payload = {
        "phone": "+998935554433",
        "password": "SecurePassword1",
        "full_name": "Ulugbek Mirzo",
    }
    res = await client.post("/api/v1/auth/register", json=reg_payload)
    tokens = res.json()
    first_refresh = tokens["refresh_token"]

    # Use refresh token
    ref_res = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": first_refresh}
    )
    assert ref_res.status_code == 200
    new_tokens = ref_res.json()
    assert "access_token" in new_tokens
    assert "refresh_token" in new_tokens

    # Attempt to reuse old rotated refresh token (must be rejected!)
    reuse_res = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": first_refresh}
    )
    assert reuse_res.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_protected_endpoint(client: AsyncClient):
    # Without token
    res_unauth = await client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401

    # Register and get token
    reg_payload = {
        "phone": "+998971112233",
        "password": "SecurePassword1",
        "full_name": "Ibn Sino",
    }
    res_reg = await client.post("/api/v1/auth/register", json=reg_payload)
    token = res_reg.json()["access_token"]

    # Access protected /auth/me
    headers = {"Authorization": f"Bearer {token}"}
    res_auth = await client.get("/api/v1/auth/me", headers=headers)
    assert res_auth.status_code == 200
    data = res_auth.json()
    assert data["phone"] == "+998971112233"
    assert data["full_name"] == "Ibn Sino"
    assert "USER" in data["roles"]

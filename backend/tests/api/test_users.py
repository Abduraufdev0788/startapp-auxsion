import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_user_profile_get_and_update(client: AsyncClient):
    # Register user
    reg_payload = {
        "phone": "+998901110022",
        "password": "Password123",
        "full_name": "Amir Temur",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get /users/me
    get_res = await client.get("/api/v1/users/me", headers=headers)
    assert get_res.status_code == 200
    user_data = get_res.json()
    assert user_data["phone"] == "+998901110022"
    assert user_data["profile"]["full_name"] == "Amir Temur"

    # Update profile
    patch_payload = {
        "full_name": "Sohibqiron Amir Temur",
        "city": "Samarqand",
        "bio": "Davlat arbobi va sarkarda",
        "email": "temur@samarqand.uz",
    }
    patch_res = await client.patch("/api/v1/users/me", json=patch_payload, headers=headers)
    assert patch_res.status_code == 200
    updated_data = patch_res.json()
    assert updated_data["profile"]["full_name"] == "Sohibqiron Amir Temur"
    assert updated_data["profile"]["city"] == "Samarqand"
    assert updated_data["profile"]["bio"] == "Davlat arbobi va sarkarda"
    assert updated_data["email"] == "temur@samarqand.uz"

    # Public profile check
    user_id = user_data["id"]
    public_res = await client.get(f"/api/v1/users/{user_id}")
    assert public_res.status_code == 200
    assert public_res.json()["profile"]["full_name"] == "Sohibqiron Amir Temur"

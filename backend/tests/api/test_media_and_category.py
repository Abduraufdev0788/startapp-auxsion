import io
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_custom_category_and_media_upload_workflow(client: AsyncClient):
    # 1. Register User/Seller
    user_reg = {
        "phone": "+998905554433",
        "password": "Password123!",
        "full_name": "Media Creator",
    }
    reg_res = await client.post("/api/v1/auth/register", json=user_reg)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add custom category via POST /api/v1/categories/custom
    cat_payload = {
        "name": "O'yin pristavkalari va disklar",
        "description": "Sony PlayStation, Xbox konsollari va video o'yinlar",
        "icon": "Gamepad2",
    }
    cat_res = await client.post("/api/v1/categories/custom", json=cat_payload, headers=headers)
    assert cat_res.status_code == 201
    cat_data = cat_res.json()
    category_id = cat_data["id"]
    assert cat_data["name"] == "O'yin pristavkalari va disklar"
    assert "slug" in cat_data
    assert isinstance(cat_data["subcategories"], list)

    # 3. Create product with this category
    product_payload = {
        "title": "Sony PlayStation 5 Pro 2TB",
        "description": "Yangi avlod konsoli, 2 ta geympad va Spider-Man 2 o'yini bilan",
        "category_id": category_id,
        "condition": "NEW",
    }
    prod_res = await client.post("/api/v1/products", json=product_payload, headers=headers)
    assert prod_res.status_code == 201
    product_id = prod_res.json()["id"]

    # 4. Upload photo via single image endpoint
    fake_image_file = ("photo.jpg", io.BytesIO(b"fake image raw bytes for test"), "image/jpeg")
    img_res = await client.post(
        f"/api/v1/products/{product_id}/images",
        files={"file": fake_image_file},
        headers=headers,
    )
    assert img_res.status_code == 201
    assert "image_url" in img_res.json()
    assert img_res.json()["image_url"].startswith("/media/products/")

    # 5. Upload multiple media (photo + video) via POST /api/v1/products/{id}/media
    fake_photo_file = ("gadget.png", io.BytesIO(b"png raw bytes"), "image/png")
    fake_video_file = ("unboxing.mp4", io.BytesIO(b"mp4 video raw bytes"), "video/mp4")
    media_res = await client.post(
        f"/api/v1/products/{product_id}/media",
        files=[("files", fake_photo_file), ("files", fake_video_file)],
        headers=headers,
    )
    assert media_res.status_code == 201
    media_data = media_res.json()
    assert media_data["count"] == 2
    assert len(media_data["uploaded_urls"]) == 2

    # 6. Verify product contains all uploaded media
    get_prod = await client.get(f"/api/v1/products/{product_id}")
    assert get_prod.status_code == 200
    prod_data = get_prod.json()
    assert len(prod_data["images"]) == 3
    urls = [img["image_url"] for img in prod_data["images"]]
    assert any(u.endswith(".mp4") for u in urls)
    assert any(u.endswith(".jpg") for u in urls)
    assert any(u.endswith(".png") for u in urls)


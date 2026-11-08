import os
import uuid
from typing import List
from fastapi import UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.integrations.storage.local import save_uploaded_file
from app.modules.categories.repository import CategoryRepository
from app.modules.products.models import ProductModel
from app.modules.products.repository import ProductRepository
from app.modules.products.schemas import ProductCreateRequest, ProductUpdateRequest

ALLOWED_MEDIA_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif",
    ".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv",
}


class ProductService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ProductRepository(db)
        self.category_repo = CategoryRepository(db)

    async def get_product(self, product_id: uuid.UUID) -> ProductModel:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundException("Mahsulot topilmadi", error_code="PRODUCT_NOT_FOUND")
        return product

    async def list_my_products(self, seller_id: uuid.UUID) -> List[ProductModel]:
        return await self.repo.list_by_seller(seller_id)

    async def create_product(self, seller_id: uuid.UUID, data: ProductCreateRequest) -> ProductModel:
        category = await self.category_repo.get_by_id(data.category_id)
        if not category:
            raise NotFoundException("Kategoriya topilmadi", error_code="CATEGORY_NOT_FOUND")

        product = await self.repo.create(seller_id, data)
        await self.db.commit()
        return product

    async def update_product(
        self, product_id: uuid.UUID, user_id: uuid.UUID, data: ProductUpdateRequest
    ) -> ProductModel:
        product = await self.get_product(product_id)
        if product.seller_id != user_id:
            raise ForbiddenException("Faqat mahsulot egasi uni tahrirlay oladi", error_code="NOT_PRODUCT_OWNER")

        if data.category_id:
            cat = await self.category_repo.get_by_id(data.category_id)
            if not cat:
                raise NotFoundException("Kategoriya topilmadi", error_code="CATEGORY_NOT_FOUND")

        updated = await self.repo.update(product, data)
        await self.db.commit()
        return updated

    def _validate_media_file(self, file: UploadFile) -> None:
        ext = os.path.splitext(file.filename or "")[1].lower()
        content_type = (file.content_type or "").lower()
        is_valid = (
            content_type.startswith("image/")
            or content_type.startswith("video/")
            or ext in ALLOWED_MEDIA_EXTENSIONS
        )
        if not is_valid:
            raise BadRequestException(
                "Faqat rasm (JPG, PNG, WebP, GIF) yoki video (MP4, WebM, MOV) formatlari qabul qilinadi",
                error_code="INVALID_MEDIA_FORMAT",
            )

    async def upload_product_image(
        self, product_id: uuid.UUID, user_id: uuid.UUID, file: UploadFile
    ) -> str:
        product = await self.get_product(product_id)
        if product.seller_id != user_id:
            raise ForbiddenException("Faqat mahsulot egasi media yuklashi mumkin", error_code="NOT_PRODUCT_OWNER")

        self._validate_media_file(file)

        file_url = await save_uploaded_file(file, folder="products")
        is_first = len(product.images) == 0
        await self.repo.add_image(product_id, file_url, is_primary=is_first, display_order=len(product.images))
        await self.db.commit()
        return file_url

    async def upload_product_media(
        self, product_id: uuid.UUID, user_id: uuid.UUID, files: List[UploadFile]
    ) -> List[str]:
        product = await self.get_product(product_id)
        if product.seller_id != user_id:
            raise ForbiddenException("Faqat mahsulot egasi media yuklashi mumkin", error_code="NOT_PRODUCT_OWNER")

        if not files:
            raise BadRequestException("Kamida bitta fayl tanlanishi lozim", error_code="NO_FILES_PROVIDED")

        uploaded_urls: List[str] = []
        current_count = len(product.images)

        for idx, file in enumerate(files):
            self._validate_media_file(file)
            file_url = await save_uploaded_file(file, folder="products")
            is_primary = (current_count == 0 and idx == 0)
            await self.repo.add_image(
                product_id,
                file_url,
                is_primary=is_primary,
                display_order=current_count + idx,
            )
            uploaded_urls.append(file_url)

        await self.db.commit()
        return uploaded_urls

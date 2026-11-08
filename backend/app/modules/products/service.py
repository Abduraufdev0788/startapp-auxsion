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

    async def upload_product_image(
        self, product_id: uuid.UUID, user_id: uuid.UUID, file: UploadFile
    ) -> str:
        product = await self.get_product(product_id)
        if product.seller_id != user_id:
            raise ForbiddenException("Faqat mahsulot egasi rasm yuklashi mumkin", error_code="NOT_PRODUCT_OWNER")

        # Validate content type
        if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
            raise BadRequestException(
                "Faqat JPG, PNG yoki WebP formatidagi rasmlar qabul qilinadi",
                error_code="INVALID_IMAGE_FORMAT",
            )

        file_url = await save_uploaded_file(file, folder="products")
        is_first = len(product.images) == 0
        await self.repo.add_image(product_id, file_url, is_primary=is_first)
        await self.db.commit()
        return file_url

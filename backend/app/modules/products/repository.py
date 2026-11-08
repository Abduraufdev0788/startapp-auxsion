import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.products.models import ProductImageModel, ProductModel
from app.modules.products.schemas import ProductCreateRequest, ProductUpdateRequest


class ProductRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, product_id: uuid.UUID) -> Optional[ProductModel]:
        stmt = (
            select(ProductModel)
            .options(selectinload(ProductModel.images))
            .where(ProductModel.id == product_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_seller(
        self, seller_id: uuid.UUID, limit: int = 50, offset: int = 0
    ) -> List[ProductModel]:
        stmt = (
            select(ProductModel)
            .options(selectinload(ProductModel.images))
            .where(ProductModel.seller_id == seller_id)
            .order_by(ProductModel.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, seller_id: uuid.UUID, data: ProductCreateRequest) -> ProductModel:
        product = ProductModel(
            seller_id=seller_id,
            category_id=data.category_id,
            title=data.title,
            description=data.description,
            condition=data.condition,
            is_approved=True,  # Auto-approve for MVP or moderation queue
        )
        self.db.add(product)
        await self.db.flush()
        return await self.get_by_id(product.id)  # type: ignore

    async def update(self, product: ProductModel, data: ProductUpdateRequest) -> ProductModel:
        if data.title is not None:
            product.title = data.title
        if data.description is not None:
            product.description = data.description
        if data.category_id is not None:
            product.category_id = data.category_id
        if data.condition is not None:
            product.condition = data.condition

        await self.db.flush()
        return product

    async def add_image(
        self, product_id: uuid.UUID, image_url: str, is_primary: bool = False, display_order: int = 0
    ) -> ProductImageModel:
        image = ProductImageModel(
            product_id=product_id,
            image_url=image_url,
            is_primary=is_primary,
            display_order=display_order,
        )
        self.db.add(image)
        await self.db.flush()
        return image

import uuid
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.categories.models import CategoryModel
from app.modules.categories.schemas import CategoryCreateRequest


class CategoryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_all_root(self) -> List[CategoryModel]:
        stmt = (
            select(CategoryModel)
            .options(selectinload(CategoryModel.subcategories))
            .where(CategoryModel.parent_id == None)  # noqa: E711
            .order_by(CategoryModel.display_order.asc(), CategoryModel.name.asc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_by_id(self, category_id: uuid.UUID) -> Optional[CategoryModel]:
        stmt = (
            select(CategoryModel)
            .options(selectinload(CategoryModel.subcategories))
            .where(CategoryModel.id == category_id)
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[CategoryModel]:
        stmt = select(CategoryModel).where(CategoryModel.slug == slug)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, data: CategoryCreateRequest) -> CategoryModel:
        category = CategoryModel(
            name=data.name,
            slug=data.slug,
            description=data.description,
            icon=data.icon,
            display_order=data.display_order,
            parent_id=data.parent_id,
        )
        self.db.add(category)
        await self.db.flush()
        return category

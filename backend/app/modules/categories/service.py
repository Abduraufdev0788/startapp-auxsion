import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictException, NotFoundException
from app.modules.categories.models import CategoryModel
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CategoryRepository(db)

    async def list_categories(self) -> List[CategoryModel]:
        return await self.repo.get_all_root()

    async def get_category(self, category_id: uuid.UUID) -> CategoryModel:
        cat = await self.repo.get_by_id(category_id)
        if not cat:
            raise NotFoundException("Kategoriya topilmadi", error_code="CATEGORY_NOT_FOUND")
        return cat

    async def create_category(self, data: CategoryCreateRequest) -> CategoryModel:
        existing = await self.repo.get_by_slug(data.slug)
        if existing:
            raise ConflictException("Ushbu slug bilan kategoriya mavjud", error_code="SLUG_EXISTS")

        if data.parent_id:
            parent = await self.repo.get_by_id(data.parent_id)
            if not parent:
                raise NotFoundException("Ota kategoriya topilmadi", error_code="PARENT_NOT_FOUND")

        cat = await self.repo.create(data)
        await self.db.commit()
        return cat

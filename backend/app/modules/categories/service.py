import re
import unicodedata
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundException
from app.modules.categories.models import CategoryModel
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest


def slugify(value: str) -> str:
    """Generate URL-friendly ASCII slug from any string."""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\w\s-]", "", value.lower())
    return re.sub(r"[-\s]+", "-", value).strip("-_")


class CategoryService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CategoryRepository(db)

    async def list_categories(self) -> List[CategoryModel]:
        categories = await self.repo.get_all_root()
        if not categories:
            await self._seed_default_categories()
            categories = await self.repo.get_all_root()
        return categories

    async def _seed_default_categories(self) -> None:
        defaults = [
            ("Elektronika va Gadjetlar", "electronics", "Smartfonlar, noutbuklar, planshetlar va aksessuarlar", "Cpu"),
            ("Avtomobillar va Texnika", "auto", "Yengil avtomobillar, mototexnika va ehtiyot qismlar", "Car"),
            ("Ko'chmas mulk", "realty", "Kvartiralar, uylar, yer uchastkalari va tijorat binolari", "Building"),
            ("San'at va Antikvariat", "art", "Noyob san'at asarlari, qadimiy tangalar va kolleksiyalar", "Palette"),
            ("Zargarlik va Brend Soatlar", "watches", "Shveysariya soatlari, oltin va kumush buyumlar", "Watch"),
            ("Maishiy texnika", "appliances", "Muzlatgichlar, televizorlar va oshxona uskunalari", "Tv"),
        ]
        for name, slug, desc, icon in defaults:
            existing = await self.repo.get_by_slug(slug)
            if not existing:
                await self.repo.create(
                    CategoryCreateRequest(
                        name=name,
                        slug=slug,
                        description=desc,
                        icon=icon,
                        display_order=0,
                    )
                )
        await self.db.commit()

    async def get_category(self, category_id: uuid.UUID) -> CategoryModel:
        cat = await self.repo.get_by_id(category_id)
        if not cat:
            raise NotFoundException("Kategoriya topilmadi", error_code="CATEGORY_NOT_FOUND")
        return cat

    async def create_category(self, data: CategoryCreateRequest) -> CategoryModel:
        # Return existing category if the name matches
        existing_by_name = await self.repo.get_by_name(data.name)
        if existing_by_name:
            return existing_by_name

        slug = data.slug or slugify(data.name)
        if not slug:
            slug = f"cat-{uuid.uuid4().hex[:6]}"

        existing_by_slug = await self.repo.get_by_slug(slug)
        if existing_by_slug:
            slug = f"{slug}-{uuid.uuid4().hex[:4]}"

        if data.parent_id:
            parent = await self.repo.get_by_id(data.parent_id)
            if not parent:
                raise NotFoundException("Ota kategoriya topilmadi", error_code="PARENT_NOT_FOUND")

        data_to_create = data.model_copy(update={"slug": slug})
        cat = await self.repo.create(data_to_create)
        await self.db.commit()
        return cat

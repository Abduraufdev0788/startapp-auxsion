import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user, require_roles
from app.modules.categories.schemas import CategoryCreateRequest, CategoryResponse
from app.modules.categories.service import CategoryService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get(
    "",
    response_model=List[CategoryResponse],
    status_code=status.HTTP_200_OK,
    summary="Barcha asosiy toifalar daraxtini olish",
)
async def list_categories(db: AsyncSession = Depends(get_db)):
    service = CategoryService(db)
    return await service.list_categories()


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Alohida toifani olish",
)
async def get_category(
    category_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    return await service.get_category(category_id)


@router.post(
    "",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi toifa yaratish (Faqat Admin)",
    dependencies=[Depends(require_roles(UserRole.ADMIN, UserRole.SUPER_ADMIN))],
)
async def create_category(
    data: CategoryCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    return await service.create_category(data)


@router.post(
    "/custom",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi toifa qo'shish (Foydalanuvchi/Sotuvchi)",
)
async def create_custom_category(
    data: CategoryCreateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = CategoryService(db)
    return await service.create_category(data)

import uuid
from typing import List
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_active_user
from app.modules.products.schemas import (
    ProductCreateRequest,
    ProductResponse,
    ProductUpdateRequest,
)
from app.modules.products.service import ProductService
from app.modules.users.models import UserModel

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yangi mahsulot yaratish",
)
async def create_product(
    data: ProductCreateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.create_product(current_user.id, data)


@router.get(
    "/my",
    response_model=List[ProductResponse],
    status_code=status.HTTP_200_OK,
    summary="Mening mahsulotlarim ro'yxatini olish",
)
async def list_my_products(
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.list_my_products(current_user.id)


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Mahsulot ma'lumotlarini olish",
)
async def get_product(
    product_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.get_product(product_id)


@router.patch(
    "/{product_id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Mahsulotni tahrirlash",
)
async def update_product(
    product_id: uuid.UUID,
    data: ProductUpdateRequest,
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    return await service.update_product(product_id, current_user.id, data)


@router.post(
    "/{product_id}/images",
    status_code=status.HTTP_201_CREATED,
    summary="Mahsulotga rasm yuklash",
)
async def upload_image(
    product_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: UserModel = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProductService(db)
    url = await service.upload_product_image(product_id, current_user.id, file)
    return {"image_url": url}

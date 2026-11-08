from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.exceptions import AuctionHubException
from app.core.logging import logger, setup_logging
from app.database.session import engine
from app.websocket.router import router as ws_router
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.categories.router import router as categories_router
from app.modules.products.router import router as products_router
from app.modules.auctions.router import router as auctions_router
from app.modules.participants.router import router as participants_router
from app.modules.bidding.router import router as bidding_router
from app.modules.payments.router import router as payments_router
from app.modules.deposits.router import router as deposits_router
from app.modules.refunds.router import router as refunds_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} in {settings.ENVIRONMENT} mode...")
    # Ensure media directory exists
    os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
    yield
    logger.info(f"Shutting down {settings.APP_NAME}...")
    await engine.dispose()


app = FastAPI(
    title=f"{settings.APP_NAME} API",
    version=settings.APP_VERSION,
    description="AuctionHub - O'zbekiston bozori uchun xavfsiz va zamonaviy onlayn auksion platformasi.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler
@app.exception_handler(AuctionHubException)
async def auctionhub_exception_handler(request: Request, exc: AuctionHubException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "error_code": exc.error_code},
        headers=exc.headers,
    )


# Mount local media directory for uploads
if os.path.exists(settings.LOCAL_STORAGE_PATH):
    app.mount("/media", StaticFiles(directory=settings.LOCAL_STORAGE_PATH), name="media")

# Include Routers
app.include_router(ws_router, prefix=settings.API_V1_STR, tags=["Real-time WebSocket"])
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(categories_router, prefix=settings.API_V1_STR)
app.include_router(products_router, prefix=settings.API_V1_STR)
app.include_router(auctions_router, prefix=settings.API_V1_STR)
app.include_router(participants_router, prefix=settings.API_V1_STR)
app.include_router(bidding_router, prefix=settings.API_V1_STR)
app.include_router(payments_router, prefix=settings.API_V1_STR)
app.include_router(deposits_router, prefix=settings.API_V1_STR)
app.include_router(refunds_router, prefix=settings.API_V1_STR)


@app.get(
    f"{settings.API_V1_STR}/health",
    tags=["System"],
    status_code=status.HTTP_200_OK,
    summary="Health check endpoint",
)
async def health_check():
    """Verify backend API, database, and system status."""
    db_status = "UNKNOWN"
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_status = "HEALTHY"
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        db_status = "UNAVAILABLE"

    return {
        "status": "HEALTHY" if db_status == "HEALTHY" else "DEGRADED",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


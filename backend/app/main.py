from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.core.logging import logger, setup_logging
from app.database.session import engine
from app.websocket.router import router as ws_router


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

# Mount local media directory for uploads
if os.path.exists(settings.LOCAL_STORAGE_PATH):
    app.mount("/media", StaticFiles(directory=settings.LOCAL_STORAGE_PATH), name="media")

# Include WebSocket router
app.include_router(ws_router, prefix=settings.API_V1_STR, tags=["Real-time WebSocket"])


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


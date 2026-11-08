from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # General
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    APP_NAME: str = "AuctionHub"
    APP_VERSION: str = "1.0.0"
    TIMEZONE: str = "Asia/Tashkent"
    API_V1_STR: str = "/api/v1"

    # URLs & CORS
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://auctionhub:auctionhub_dev_secret@localhost:5432/auctionhub_db"
    POSTGRES_USER: str = "auctionhub"
    POSTGRES_PASSWORD: str = "auctionhub_dev_secret"
    POSTGRES_DB: str = "auctionhub_db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Security & JWT
    JWT_SECRET_KEY: str = "auctionhub-local-dev-jwt-secret-key-32-chars-long!"
    JWT_REFRESH_SECRET_KEY: str = "auctionhub-local-dev-jwt-refresh-secret-key-32-chars-long!"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # Payment Gateway
    PAYMENT_PROVIDER: str = "sandbox"
    PAYMENT_MERCHANT_ID: str = "sandbox_merchant_001"
    PAYMENT_SECRET_KEY: str = "sandbox_secret_key_001"
    PAYMENT_WEBHOOK_SECRET: str = "sandbox_webhook_secret_001"
    PAYMENT_CURRENCY: str = "UZS"

    # File Storage
    STORAGE_PROVIDER: str = "local"
    LOCAL_STORAGE_PATH: str = "./media_uploads"

    # Business Rules
    MIN_AUCTION_DURATION_HOURS: int = 1
    MAX_AUCTION_DURATION_DAYS: int = 30
    DEFAULT_BID_EXTENSION_MINUTES: int = 5
    BID_EXTENSION_THRESHOLD_MINUTES: int = 2
    DEFAULT_WINNER_PAYMENT_DEADLINE_DAYS: int = 3


settings = Settings()


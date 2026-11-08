import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database.base import Base
from app.database.session import get_db
from app.main import app as fastapi_app

# Import all models so metadata discovers them
import app.modules.auth.models  # noqa
import app.modules.users.models  # noqa
import app.modules.categories.models  # noqa
import app.modules.products.models  # noqa
import app.modules.auctions.models  # noqa
import app.modules.participants.models  # noqa
import app.modules.bidding.models  # noqa
import app.modules.deposits.models  # noqa
import app.modules.payments.models  # noqa
import app.modules.escrow.models  # noqa
import app.modules.refunds.models  # noqa
import app.modules.settlements.models  # noqa
import app.modules.deliveries.models  # noqa
import app.modules.notifications.models  # noqa
import app.modules.favorites.models  # noqa
import app.modules.disputes.models  # noqa
import app.modules.admin.models  # noqa


test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
async def setup_test_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


@pytest.fixture
async def client():
    async def override_get_db():
        async with TestingSessionLocal() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=fastapi_app), base_url="http://test"
    ) as ac:
        yield ac

    fastapi_app.dependency_overrides.clear()

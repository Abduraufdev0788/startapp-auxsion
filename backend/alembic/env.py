import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

from app.core.config import settings
from app.database.base import Base
# Import all models here so Alembic can discover them for autogenerate
import app.modules.auth.models  # noqa
import app.modules.users.models  # noqa
import app.modules.products.models  # noqa
import app.modules.categories.models  # noqa
import app.modules.auctions.models  # noqa
import app.modules.bidding.models  # noqa
import app.modules.participants.models  # noqa
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

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_url():
    return str(settings.DATABASE_URL)

def run_migrations_offline() -> None:
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()

async def run_async_migrations() -> None:
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = get_url()
    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()

def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


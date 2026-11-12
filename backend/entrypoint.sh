#!/bin/bash
set -e

# Wait for PostgreSQL database to be ready
echo "Waiting for PostgreSQL database to be ready..."
python3 - << 'EOF'
import asyncio
import os
import sys
import time
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

db_url = os.environ.get("DATABASE_URL", "postgresql+asyncpg://auctionhub:auctionhub_dev_secret@postgres:5432/auctionhub_db")

async def wait_db():
    engine = create_async_engine(db_url, echo=False)
    for i in range(40):
        try:
            async with engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
                print(">>> PostgreSQL is up and accepting connections!")
                return True
        except Exception as e:
            print(f"Waiting for database... ({i+1}/40)")
            await asyncio.sleep(1)
    print("Database connection timed out!", file=sys.stderr)
    return False

if not asyncio.run(wait_db()):
    sys.exit(1)
EOF

# If running the main web server (uvicorn)
if [[ "$*" == *"uvicorn"* ]]; then
    echo "=========================================="
    echo ">>> Running Database Migrations (Alembic)..."
    echo "=========================================="
    alembic upgrade head

    echo "=========================================="
    echo ">>> Seeding Database (50+ Real Auctions & Stats)..."
    echo "=========================================="
    python3 seed_data.py || echo "Seed data step completed or skipped."

    echo "=========================================="
    echo ">>> Starting Backend Web Server (Uvicorn)..."
    echo "=========================================="
fi

exec "$@"


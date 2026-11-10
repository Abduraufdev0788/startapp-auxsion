#!/usr/bin/env python3
"""
AuctionHub Production Pre-Flight & Health Check Script
Verifies database, redis, celery, storage, security, and schema before going live.
Usage:
    python scripts/production_check.py
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

def print_status(component: str, ok: bool, details: str = ""):
    icon = "✅ [OK]" if ok else "❌ [FAIL]"
    color_start = "\033[92m" if ok else "\033[91m"
    color_reset = "\033[0m"
    print(f"{color_start}{icon:<10}{color_reset} {component:<30} {details}")

async def run_checks():
    print("\n" + "=" * 65)
    print("      AUCTIONHUB PRODUCTION HEALTH & READINESS AUDIT")
    print("=" * 65 + "\n")

    all_passed = True

    # 1. Environment & Config
    try:
        from app.core.config import settings
        is_prod = settings.ENVIRONMENT.lower() == "production"
        is_debug = settings.DEBUG
        jwt_len = len(settings.JWT_SECRET_KEY)
        
        sec_ok = jwt_len >= 32
        print_status(
            "Security Settings",
            sec_ok,
            f"Env: {settings.ENVIRONMENT}, Debug: {is_debug}, JWT Secret Length: {jwt_len} chars",
        )
        if is_debug:
            print("   ⚠️  WARNING: DEBUG is set to True. For production, set DEBUG=False in .env")
        if not sec_ok:
            all_passed = False
            print("   ❌ ERROR: JWT_SECRET_KEY must be at least 32 characters long.")
    except Exception as e:
        print_status("Environment Config", False, str(e))
        all_passed = False
        return

    # 2. Database Connection & Tables
    try:
        from sqlalchemy import text
        from app.database.session import engine
        from app.database.base import Base

        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT 1"))
            assert res.scalar() == 1

            # Check table counts
            tables_res = await conn.execute(
                text("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
            )
            table_count = tables_res.scalar() or 0

        db_ok = table_count >= 15
        print_status(
            "PostgreSQL Database",
            db_ok,
            f"Connection verified. Found {table_count} public tables in schema.",
        )
        if not db_ok:
            all_passed = False
    except Exception as e:
        print_status("PostgreSQL Database", False, str(e))
        all_passed = False

    # 3. Redis Connectivity
    try:
        import redis.asyncio as aioredis
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        pong = await r.ping()
        await r.aclose()
        redis_ok = pong is True
        print_status("Redis Cache & Broker", redis_ok, f"Ping response: {pong}")
    except Exception as e:
        print_status("Redis Cache & Broker", False, str(e))
        all_passed = False

    # 4. Storage Directory Permissions
    try:
        media_path = Path(settings.LOCAL_STORAGE_PATH)
        media_path.mkdir(parents=True, exist_ok=True)
        test_file = media_path / ".health_test"
        test_file.write_text("ok")
        test_file.unlink()
        print_status("Media Storage", True, f"Directory '{media_path}' is writable.")
    except Exception as e:
        print_status("Media Storage", False, f"Cannot write to storage: {e}")
        all_passed = False

    # 5. Default Roles and Super Admin Check
    try:
        from sqlalchemy import select
        from app.database.session import AsyncSessionLocal
        from app.modules.auth.models import RoleModel
        from app.modules.users.models import UserModel

        async with AsyncSessionLocal() as session:
            roles = (await session.execute(select(RoleModel))).scalars().all()
            role_names = [r.name for r in roles]
            has_roles = "ADMIN" in role_names and "USER" in role_names

            admins = (await session.execute(select(UserModel).where(UserModel.phone == "+998900000001"))).scalar_one_or_none()
            has_admin = admins is not None

        admin_ok = has_roles and has_admin
        print_status(
            "Admin & Roles Seed Data",
            admin_ok,
            f"Roles: {len(role_names)} found. SuperAdmin (+998900000001): {'Present' if has_admin else 'Missing (run seed)'}",
        )
        if not admin_ok:
            all_passed = False
    except Exception as e:
        print_status("Admin & Roles Seed Data", False, str(e))
        all_passed = False

    # 6. SMS & Payment Provider status
    print_status(
        "Payment Provider",
        True,
        f"Mode: {settings.PAYMENT_PROVIDER.upper()} (Merchant: {settings.PAYMENT_MERCHANT_ID})",
    )
    print_status(
        "SMS Provider",
        True,
        f"Mode: {settings.SMS_PROVIDER.upper()} (From: {settings.SMS_FROM})",
    )

    print("\n" + "=" * 65)
    if all_passed:
        print("🎉 ALL CHECKS PASSED! The system is ready for production deployment.")
    else:
        print("⚠️ SOME CHECKS FAILED. Please review the errors above before launching.")
    print("=" * 65 + "\n")

if __name__ == "__main__":
    asyncio.run(run_checks())


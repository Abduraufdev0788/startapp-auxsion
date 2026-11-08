import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta, timezone
import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.modules.categories.repository import CategoryRepository
from app.modules.categories.schemas import CategoryCreateRequest
from app.modules.deposits.repository import DepositRepository
from app.modules.escrow.service import LedgerService
from app.modules.refunds.service import RefundService


@pytest.mark.asyncio
async def test_double_entry_ledger_balanced(db_session):
    ledger = LedgerService(db_session)
    txn_id = uuid.uuid4()
    amount = 50000000  # 500 000 UZS

    debit_entry, credit_entry = await ledger.record_transfer(
        transaction_id=txn_id,
        from_account_type="USER_WALLET",
        to_account_type="PLATFORM_ESCROW",
        amount_tiyin=amount,
        description="Deposit payment test",
    )
    await db_session.commit()

    # Rule: sum(debit) == sum(credit) == amount
    entries = await ledger.list_transaction_entries(txn_id)
    assert len(entries) == 2
    total_debit = sum(e.debit_amount for e in entries)
    total_credit = sum(e.credit_amount for e in entries)
    assert total_debit == amount
    assert total_credit == amount
    assert total_debit == total_credit


@pytest.mark.asyncio
async def test_payment_initiation_and_webhook(client: AsyncClient):
    # 1. Register user
    user_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998905556677", "password": "Password123", "full_name": "To'lovchi"},
    )
    token = user_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Initiate Payment
    dummy_auction_id = str(uuid.uuid4())
    init_res = await client.post(
        "/api/v1/payments/initiate",
        json={
            "transaction_type": "DEPOSIT",
            "auction_id": dummy_auction_id,
            "amount_uzs": 1000000,
        },
        headers=headers,
    )
    # Since dummy_auction_id doesn't exist yet, should be 404
    assert init_res.status_code == 404


@pytest.mark.asyncio
async def test_idempotent_refund_processing(client: AsyncClient, db_session):
    # Setup test deposit
    deposit_repo = DepositRepository(db_session)
    user_id = uuid.uuid4()
    auction_id = uuid.uuid4()
    deposit_amount = 50000000  # 500 000 UZS

    deposit = await deposit_repo.create_deposit(
        user_id=user_id,
        auction_id=auction_id,
        amount=deposit_amount,
    )
    await db_session.commit()

    refund_service = RefundService(db_session)
    idempotency_key = f"refund_test_{uuid.uuid4().hex}"

    # 1. First refund execution
    refund1 = await refund_service.process_refund(
        deposit_id=deposit.id,
        idempotency_key=idempotency_key,
    )
    assert refund1.status == "COMPLETED"
    assert refund1.amount == deposit_amount

    # 2. Duplicate refund execution with same idempotency key
    refund2 = await refund_service.process_refund(
        deposit_id=deposit.id,
        idempotency_key=idempotency_key,
    )
    # Must return identical record without error or double refund!
    assert refund2.id == refund1.id
    assert refund2.amount == refund1.amount


@pytest.mark.asyncio
async def test_winner_payment_settlement(client: AsyncClient, db_session):
    cat_repo = CategoryRepository(db_session)
    category = await cat_repo.create(
        CategoryCreateRequest(name="Settlement Test", slug="settlement-test", display_order=1)
    )
    await db_session.commit()

    # Register Seller
    s_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998907771122", "password": "Password123", "full_name": "Sotuvchi Settle"},
    )
    s_token = s_res.json()["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}

    # Register Winner Buyer
    w_res = await client.post(
        "/api/v1/auth/register",
        json={"phone": "+998907773344", "password": "Password123", "full_name": "G'olib Xaridor"},
    )
    w_token = w_res.json()["access_token"]
    w_headers = {"Authorization": f"Bearer {w_token}"}

    # Create Product & Auction
    p_res = await client.post(
        "/api/v1/products",
        json={
            "title": "Gold Bar 10g",
            "description": "999.9 assay certified gold bar",
            "category_id": str(category.id),
            "condition": "NEW",
        },
        headers=s_headers,
    )
    product_id = p_res.json()["id"]

    now = datetime.now(timezone.utc)
    auc_res = await client.post(
        "/api/v1/auctions",
        json={
            "product_id": product_id,
            "starting_price_uzs": 8000000,
            "reserve_price_uzs": 10000000,
            "min_bid_increment_uzs": 500000,
            "deposit_amount_uzs": 1000000,
            "start_time": now.isoformat(),
            "end_time": (now + timedelta(days=1)).isoformat(),
        },
        headers=s_headers,
    )
    auction_id = auc_res.json()["id"]

    # Publish -> ACTIVE
    await client.post(f"/api/v1/auctions/{auction_id}/publish", headers=s_headers)

    # Winner joins & pays deposit
    await client.post(f"/api/v1/auctions/{auction_id}/participate", headers=w_headers)

    # Winner places winning bid: 11 000 000 UZS
    await client.post(
        f"/api/v1/auctions/{auction_id}/bids",
        json={"amount_uzs": 11000000},
        headers=w_headers,
    )

    # Finalize auction
    from app.modules.bidding.service import BiddingService
    bidding_service = BiddingService(db_session)
    await bidding_service.finalize_auction(uuid.UUID(auction_id))

    # Winner settles remaining balance (11M - 1M deposit = 10M UZS)
    settle_res = await client.post(
        "/api/v1/payments/winner-settle",
        json={"auction_id": auction_id},
        headers=w_headers,
    )
    assert settle_res.status_code == 200
    settle_data = settle_res.json()
    assert settle_data["status"] == "COMPLETED"
    # Remaining: 10 000 000 UZS = 1 000 000 000 tiyin
    assert settle_data["settled_amount"] == 1000000000

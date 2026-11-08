import pytest
import uuid
from httpx import AsyncClient
from app.modules.escrow.service import LedgerService
from app.modules.deposits.repository import DepositRepository
from app.modules.refunds.service import RefundService


@pytest.mark.asyncio
async def test_wallet_balance_and_withdrawals(client: AsyncClient, db_session):
    # 1. Register and login a user
    register_data = {
        "phone": "+998901234567",
        "password": "Password123!",
        "full_name": "Test Wallet User",
    }
    reg_res = await client.post("/api/v1/auth/register", json=register_data)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Check initial wallet balance (should be 0)
    bal_res = await client.get("/api/v1/payments/wallet", headers=headers)
    assert bal_res.status_code == 200
    bal_data = bal_res.json()
    assert bal_data["balance_uzs"] == 0
    assert bal_data["balance_tiyin"] == 0

    # 3. Simulate crediting 500,000 UZS to user wallet (e.g. from a refunded deposit)
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    user_id = uuid.UUID(me_res.json()["id"])

    ledger = LedgerService(db_session)
    await ledger.record_transfer(
        transaction_id=uuid.uuid4(),
        from_account_type="PLATFORM_ESCROW",
        to_account_type="USER_WALLET",
        amount_tiyin=50000000,  # 500 000 UZS
        description="Participation deposit refund from completed auction",
        to_user_id=user_id,
    )
    await db_session.commit()

    # 4. Check wallet balance now (should be 500 000 UZS)
    bal_res2 = await client.get("/api/v1/payments/wallet", headers=headers)
    assert bal_res2.status_code == 200
    assert bal_res2.json()["balance_uzs"] == 500000

    # 5. Attempt withdrawal with insufficient funds (e.g. 700 000 UZS) -> should fail
    fail_withdraw = await client.post(
        "/api/v1/payments/withdraw",
        headers=headers,
        json={
            "amount_uzs": 700000,
            "card_number": "8600 1234 5678 9012",
            "card_holder": "Test Wallet User",
        },
    )
    assert fail_withdraw.status_code == 400
    assert "INSUFFICIENT_FUNDS" in fail_withdraw.json().get("error_code", "")

    # 6. Attempt valid withdrawal (e.g. 200 000 UZS to Uzcard)
    ok_withdraw = await client.post(
        "/api/v1/payments/withdraw",
        headers=headers,
        json={
            "amount_uzs": 200000,
            "card_number": "8600123456789012",
            "card_holder": "Test Wallet User",
        },
    )
    assert ok_withdraw.status_code == 201
    w_data = ok_withdraw.json()
    assert w_data["amount_uzs"] == 200000
    assert w_data["card_type"] == "UZCARD"
    assert "8600 **** **** 9012" == w_data["card_number_masked"]
    assert w_data["status"] == "COMPLETED"

    # 7. Check wallet balance after withdrawal (500 000 - 200 000 = 300 000 UZS)
    bal_res3 = await client.get("/api/v1/payments/wallet", headers=headers)
    assert bal_res3.status_code == 200
    assert bal_res3.json()["balance_uzs"] == 300000

    # 8. List withdrawals
    w_list_res = await client.get("/api/v1/payments/withdrawals", headers=headers)
    assert w_list_res.status_code == 200
    w_items = w_list_res.json()
    assert len(w_items) == 1
    assert w_items[0]["amount_uzs"] == 200000

    # 9. List wallet transactions
    tx_res = await client.get("/api/v1/payments/wallet/transactions", headers=headers)
    assert tx_res.status_code == 200
    tx_items = tx_res.json()
    assert len(tx_items) >= 2  # 1 credit + 1 debit

import pytest
from app.workers.auction_tasks import (
    check_scheduled_auctions_task,
    finalize_expired_auctions_task,
)
from app.workers.refund_tasks import process_auction_refunds_task
from app.workers.payment_tasks import check_winner_payment_deadlines_task
from app.workers.notification_tasks import (
    send_sms_notification_task,
    send_email_notification_task,
)


def _mock_asyncio_run(coro):
    # Properly close coroutine so Python runtime warning is avoided
    coro.close()
    return None


def test_notification_tasks():
    sms_res = send_sms_notification_task("+998901234567", "Test SMS")
    assert sms_res == "SENT"

    email_res = send_email_notification_task("test@auctionhub.uz", "Test Subject", "Content")
    assert email_res == "SENT"


def test_auction_periodic_tasks(mocker):
    mock_run = mocker.patch("asyncio.run", side_effect=_mock_asyncio_run)

    res_sched = check_scheduled_auctions_task()
    assert res_sched == "SUCCESS"
    assert mock_run.call_count == 1

    res_final = finalize_expired_auctions_task()
    assert res_final == "SUCCESS"
    assert mock_run.call_count == 2


def test_refund_and_payment_deadlines_tasks(mocker):
    mock_run = mocker.patch("asyncio.run", side_effect=_mock_asyncio_run)

    res_refund = process_auction_refunds_task("11111111-1111-1111-1111-111111111111")
    assert res_refund == "SUCCESS"

    res_deadline = check_winner_payment_deadlines_task()
    assert res_deadline == "SUCCESS"

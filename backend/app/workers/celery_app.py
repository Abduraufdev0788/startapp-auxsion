from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "auctionhub_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone=settings.TIMEZONE,
    enable_utc=True,
    beat_schedule={
        "check-scheduled-auctions-every-minute": {
            "task": "app.workers.auction_tasks.check_scheduled_auctions_task",
            "schedule": 60.0,
        },
        "finalize-expired-auctions-every-minute": {
            "task": "app.workers.auction_tasks.finalize_expired_auctions_task",
            "schedule": 60.0,
        },
    },
)

celery_app.autodiscover_tasks(
    [
        "app.workers.auction_tasks",
        "app.workers.refund_tasks",
        "app.workers.payment_tasks",
        "app.workers.notification_tasks",
    ]
)


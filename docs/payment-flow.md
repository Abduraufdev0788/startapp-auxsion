# To'lov va Escrow Oqimi (Payment Flow)

## 1. Depozit To'lash
```mermaid
sequenceDiagram
    participant User as Xaridor
    participant Front as Frontend
    participant API as AuctionHub API
    participant PG as To'lov Tizimi (Provider)
    participant Celery as Fon Ishchi (Celery)

    User->>Front: "Ishtirok etish" tugmasini bosadi
    Front->>API: POST /api/v1/auctions/{id}/participate
    API->>API: Depozit yozuvi (PENDING) yaratiladi
    API-->>Front: To'lov sahifasi havolasi (checkout_url)
    Front->>PG: Foydalanuvchi to'lovni amalga oshiradi
    PG->>API: Webhook (To'lov tasdiqlandi, signature bilan)
    API->>API: Imzo va summani tekshiradi, holatni PAID -> LOCKED qiladi
    API-->>PG: 200 OK
    API->>Front: WebSocket orqali "Ishtirok tasdiqlandi" xabari
```

## 2. Yutqazganlarga Depozit Qaytarish (Refunds)
1. Auksion `COMPLETED` yoki `NO_WINNER` bo'lganda, barcha no-winning ishtirokchilar `REFUND_PENDING` holatiga o'tkaziladi.
2. Celery vazifasi to'lov provayderining qaytarish API'si orqali summani orqaga qaytaradi.
3. Provayder tasdiqlagach holat `REFUNDED` deb belgilanadi va xaridordan xabar yuboriladi.
4. Idempotency kalitlari orqali bir xil depozit ikki marta qaytarilishidan to'liq himoyalangan.


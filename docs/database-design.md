# Ma'lumotlar Bazasi Tuzilmasi (Database Design)

PostgreSQL 16 ma'lumotlar bazasi arxitekturasi:

## 1. Asosiy Prinsiplar
- Barcha jadvallarda `UUID` birlamchi kalit (Primary Key) sifatida ishlatiladi.
- Moliyaviy miqdorlar uchun `BigInteger` (minor units / tiyin) ishlatiladi, hech qachon suzuvchi nuqtali sonlar (`float`) ishlatilmaydi.
- Tranzaksiyalar va audit yozuvlari tahrirlanmaydi (immutable ledger).
- Barcha vaqt maydonlari `TIMESTAMPTZ` (UTC / Asia/Tashkent).

## 2. Asosiy Jadvallar

### Identifikatsiya (Identity & RBAC)
- `users`: id, email, phone, hashed_password, is_active, is_verified, created_at, updated_at
- `user_profiles`: user_id, full_name, avatar_url, bio
- `roles`: id, name (GUEST, USER, SELLER, ADMIN, SUPER_ADMIN), description
- `user_roles`: user_id, role_id

### Mahsulotlar va Auksionlar
- `categories`: id, name, slug, icon, parent_id
- `products`: id, seller_id, title, description, category_id, condition, created_at
- `product_images`: id, product_id, image_url, is_primary, display_order
- `auctions`:
  - id, seller_id, product_id, starting_price, reserve_price, min_increment, deposit_amount
  - current_highest_bid, highest_bidder_id, bid_count, participant_count
  - start_time, end_time, status (DRAFT, SCHEDULED, ACTIVE, FINALIZING, COMPLETED, NO_WINNER, CANCELLED)
- `auction_participants`: id, auction_id, user_id, deposit_id, status (ELIGIBLE, BLOCKED)
- `bids`: id, auction_id, user_id, amount, created_at (Indexed & Immutable)
- `auction_results`: id, auction_id, winner_id, winning_bid, payment_deadline, payment_status

### Moliya va To'lovlar (Financial & Ledger)
- `deposits`: id, user_id, auction_id, amount, currency, status, provider_ref
- `payment_transactions`: id, user_id, type (DEPOSIT, WINNER_PAYMENT, REFUND), amount, status, idempotency_key
- `financial_ledger`: id, transaction_id, account_id, debit_amount, credit_amount, currency, created_at
- `refunds`: id, deposit_id, user_id, amount, status, retry_count, idempotency_key


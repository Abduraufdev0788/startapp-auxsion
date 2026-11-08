# Arxitektura Qarorlari (Architecture Decision Records - ADR)

Ushbu bo'limda AuctionHub loyihasida qabul qilingan muhim arxitekturaviy qarorlar qayd etib boriladi:

- **ADR-001: Modular Monolith tanlovi** — Boshlang'ich mikroxizmatlar xarajatlaridan qochish, ammo domenlarni toza modullarga ajratish uchun FastAPI asosida modular monolit tanlandi.
- **ADR-002: Moliyaviy hisob-kitoblar aniqligi** — Hech qanday `float` son ishlatilmaydi. Barcha UZS hisob-kitoblar BigInteger tiyin (minor units) orqali yuritiladi.
- **ADR-003: Concurrent Bidding poygasi** — Auksionga narx taklif qilishda poyga holatini bartaraf etish uchun PostgreSQL darajasidagi `SELECT ... FOR UPDATE` tanlandi.
- **ADR-004: Server Authority** — Mijoz taymerlariga ishonilmaydi, server soati vaqti yagona qaror manbasi bo'ladi.


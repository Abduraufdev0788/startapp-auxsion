# Xavfsizlik Talablari va Kafolatlari (Security Specifications)

## 1. Autentifikatsiya va Avtorizatsiya
- **Parollarni xeshlash**: Argon2id yoki Bcrypt (tuzlangan).
- **JWT tokenlar**: Qisqa muddatli Access Token (30 daqiqa), uzoq muddatli aylanma Refresh Token (7 kun).
- **RBAC**: Har bir endpoint backend darajasida qat'iy tekshiriladi. Frontend yuborgan rolga hech qachon ishonilmaydi.

## 2. Moliyaviy Xavfsizlik
- **Imzoli Webhooklar**: To'lov provayderi yuborgan barcha webhooklar maxfiy kalit (HMAC SHA256) orqali imzosi tekshiriladi.
- **Idempotency**: Qayta yuborilgan to'lov yoki refund so'rovlari bazadagi yagona cheklovlar (Unique Constraints) sababli takroran bajarilmaydi.
- **Double-Entry Ledger**: Balanslar to'g'ridan-to'g'ri o'zgartirilmaydi, har bir harakat debit/kredit yozuvi bilan asoslanadi.

## 3. Auksion Poygasi va Manipulyatsiya Himoyasi
- **Concurrent Bidding**: `SELECT ... FOR UPDATE` row-level lock yordamida ikkita bir vaqtdagi taklif tartib bilan qabul qilinadi.
- **O'ziga taklif berish taqiqlangan**: Sotuvchi o'z mahsulotiga narx taklif qila olmaydi.
- **Server Clock Authority**: Taymerlar clientda vizual ko'rsatiladi, ammo server vaqti yagona qaror qabul qiluvchi organ.


# AuctionHub Biznes Qoidalari

## 1. Auksion Yaratish
1. Sotuvchi autentifikatsiyadan o'tgan bo'lishi shart.
2. Boshlang'ich narx (`starting_price`) > 0 bo'lishi shart.
3. Minimal sotish narxi (`reserve_price` / `minimum_price`) >= `starting_price` bo'lishi shart.
4. Qatnashish depoziti (`deposit_amount`) > 0 bo'lishi shart.
5. Auksion muddati: minimal 1 soat, maksimal 30 kun.
6. Auksion faol (`ACTIVE`) holatga o'tgandan so'ng, asosiy shartlarni o'zgartirib bo'lmaydi.
7. Sotuvchi o'z auksionida ishtirok eta olmaydi.

## 2. Depozit va Ishtirok
1. Foydalanuvchi faqatgina depozit to'lovi to'liq tasdiqlangandan (`PAID` -> `LOCKED`) so'ng auksionda narx taklif qila oladi.
2. Depozit holatlari:
   - `PENDING`: To'lov kutilmoqda.
   - `PAID`: To'lov qabul qilindi.
   - `LOCKED`: Auksion ishtiroki uchun bloklandi.
   - `REFUND_PENDING`: Qaytarish jarayonida.
   - `REFUNDED`: To'liq qaytarildi (yutqazganlarga).
   - `APPLIED_TO_PURCHASE`: Yutuq summasiga hisoblandi (g'olibga).
   - `FORFEITED`: Musodara qilindi (g'olib to'lov muddatida to'lamasa).
   - `FAILED`: Xatolik.

## 3. Narx Taklif Qilish (Bidding)
1. Har bir yangi taklif amaldagi eng yuqori taklifdan kamida `min_bid_increment` miqdorida katta bo'lishi shart.
2. Takliflar o'zgarmas (immutable) bo'lib, bazaga yozilgach bekor qilinmaydi.
3. Server vaqti auksion tugashini belgilovchi yagona haqiqat manbasi hisoblanadi.

## 4. Poyga Holati Himoyasi (Concurrent Bidding)
- Bir nechta ishtirokchi bir soniyada taklif berganda, PostgreSQL darajasida `SELECT ... FOR UPDATE` row-level lock qo'llaniladi.
- Faqatgina birinchi tranzaksiya o'tadi, keyingisi yangi narxga nisbatan qayta tekshiriladi.


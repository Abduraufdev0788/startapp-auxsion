# API Hujjatlari (API Documentation)

Barcha API so'rovlari `/api/v1` prefiksi ostida amalga oshiriladi.

## Asosiy Guruhlar:
- `/auth`: Registratsiya, login, token yangilash, logout, parolni tiklash.
- `/users`: Profil ma'lumotlari, shaxsiy operatsiyalar.
- `/products`: Mahsulot yaratish, tahrirlash, rasmlar yuklash.
- `/categories`: Mahsulot toifalari daraxti.
- `/auctions`: Auksion yaratish, qidirish, saralash, batafsil ma'lumot, ishtirokchilar ro'yxati.
- `/auctions/{id}/participate`: Auksionda depozit to'lab qatnashish.
- `/auctions/{id}/bids`: Narx taklif qilish va takliflar tarixi.
- `/deposits`: Depozitlar ro'yxati va holati.
- `/payments`: To'lovlarni boshlash va webhook qabul qiluvchi endpointlar.
- `/refunds`: Qaytarilgan mablag'lar monitoringi.
- `/notifications`: Foydalanuvchi bildirishnomalari.
- `/admin`: Moderator va adminlar uchun platformani boshqarish paneli.
- `/ws`: Real-vaqt WebSocket ulanish kanali.

To'liq interaktiv hujjatlar ilova ishga tushganda `http://localhost:8000/docs` manzilida mavjud bo'ladi.


# Deploy Qilish Yo'riqnomasi (Deployment Guide)

## 1. Ishlab Chiqish (Development)
Docker Compose orqali barcha servislar birgalikda ishga tushadi:
```bash
make up
```

## 2. Ishlab Chiqarish (Production)
Production muhitida quyidagilar ta'minlanishi shart:
- Barcha maxfiy kalitlar (JWT, To'lov parollari, DB parollari) `.env` faylida kuchli tasodifiy satrlar bilan to'ldiriladi.
- HTTPS sertifikatlari (Let's Encrypt / Certbot) Nginx orqali ulanadi.
- PostgreSQL va Redis portlari tashqi tarmoqqa yopiladi (`ports:` faqat ichki Docker tarmog'ida bo'ladi).
- Baza zaxira nusxalari (automated daily backups) sozlanadi.
- Celery workerlar va beat alohida konteynerlarda barqaror ishlashi ta'minlanadi.


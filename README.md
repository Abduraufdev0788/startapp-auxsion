# AuctionHub

> O‘zbekiston bozori uchun mo‘ljallangan ishonchli, xavfsiz va zamonaviy onlayn auksion platformasi.

AuctionHub — foydalanuvchilar o‘z mahsulotlarini auksionga qo‘yishi, xaridorlar qaytariladigan kafolat depoziti orqali savdolarda qatnashishi, real-vaqt rejimida (WebSocket) raqobatli narx taklif qilishi va xavfsiz xaridni amalga oshirishi mumkin bo‘lgan yirik auksion marketplace platformasi.

---

## 🚀 Texnologik stak

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0 (asyncio + asyncpg), Alembic, Pydantic v2, Celery, Redis
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, TanStack Query
- **Baza va Kesh:** PostgreSQL 16, Redis 7
- **Real-Time:** WebSocket (Jonli savdolar va takliflar)
- **DevOps & Infratuzilma:** Docker, Docker Compose, Nginx

---

## 📂 Loyiha tuzilmasi

```text
auctionhub/
├── docs/                 # Loyiha arxitekturasi va biznes qoidalari hujjatlari
├── backend/              # FastAPI modular monolit backend
│   ├── alembic/          # Baza migratsiyalari
│   ├── app/              # Asosiy dastur kodi (modullar, core, database, workers, websocket)
│   └── tests/            # Unit, integratsiya va xavfsizlik testlari
├── frontend/             # React + TypeScript SPA mijoz interfeysi
├── infrastructure/       # Docker, Nginx va deployment skriptlari
├── docker-compose.yml    # Ishlab chiqish va servislar orkestratsiyasi
├── Makefile              # Tezkor boshqaruv buyruqlari
└── AGENTS.md             # To‘liq loyiha spetsifikatsiyasi
```

---

## 🛠 Ishga tushirish (Local Setup)

### 1. Talablar
- Docker & Docker Compose (v2+)
- Python 3.12+ (lokal testlar uchun)
- Node.js 18+ (lokal frontend uchun)

### 2. Docker orqali to‘liq ishga tushirish

```bash
# 1. Konfiguratsiyani nusxalash
cp .env.example .env

# 2. Servislarni qurish va fonda ishga tushirish
make up
# yoki: docker compose up -d --build

# 3. Loglarni kuzatish
make logs
```

### 3. Asosiy manzillar
- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 🧪 Testlarni ishga tushirish

```bash
# Backend testlari
make test-backend

# Frontend testlari
make test-frontend
```

---

## 📜 Litsenziya
Ushbu loyiha [MIT](LICENSE) litsenziyasi asosida tarqatiladi.


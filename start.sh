#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 LOTLY AUCTION PLATFORM — SERVER RUN SCRIPT"
echo "=========================================================="

# 1. Check & create .env if missing
if [ ! -f .env ]; then
    echo "📋 .env fayli topilmadi, .env.example dan nusxa olinmoqda..."
    cp .env.example .env
fi

# 2. Build and start all Docker services
echo "🐳 Docker konteynerlari yig'ilmoqda va ishga tushirilmoqda..."
docker compose up -d --build

# 3. Wait a few seconds for services to initialize
echo "⏳ Tizim ishga tushirilishi kutilmoqda (Postgres, Backend, Seed)..."
sleep 5

# 4. Show status
echo ""
echo "=========================================================="
echo "✅ Barcha xizmatlar muvaffaqiyatli ishga tushirildi!"
echo "=========================================================="
docker compose ps

echo ""
echo "🌐 Saytga kirish uchun manzillar:"
PUBLIC_IP=$(curl -s ifconfig.me || echo "54.79.65.175")
echo "👉 Frontend (Asosiy sayt):  http://${PUBLIC_IP}:5173"
echo "👉 Backend API & Swagger:    http://${PUBLIC_IP}:8000/docs"
echo "=========================================================="
echo "ℹ️  Eslatma: Agar brauzerda ochilmasa, AWS Security Group'da"
echo "   5173 va 8000 portlari (Custom TCP 0.0.0.0/0) ochiqligini tekshiring."
echo "=========================================================="

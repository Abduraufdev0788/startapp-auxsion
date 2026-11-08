.PHONY: help up down restart logs build migrate test-backend test-frontend clean

help: ## Ushbu yordam oynasini ko'rsatish
	@echo "AuctionHub Loyihasi Boshqaruv Buyruqlari:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

up: ## Docker konteynerlarini ishga tushirish
	docker compose up -d

down: ## Docker konteynerlarini to'xtatish
	docker compose down

restart: ## Konteynerlarni qayta ishga tushirish
	docker compose down && docker compose up -d

build: ## Konteynerlarni qayta build qilish
	docker compose build

logs: ## Konteynerlar loglarini kuzatish
	docker compose logs -f

migrate: ## Baza migratsiyalarini qo'llash (Alembic)
	docker compose exec backend alembic upgrade head

seed: ## Baza uchun boshlang'ich demo ma'lumotlarni yuklash (Kategoriyalar, lotlar, foydalanuvchilar)
	docker compose exec backend python -m app.database.seed

test-backend: ## Backend testlarini ishga tushirish
	docker compose exec backend pytest

test-frontend: ## Frontend testlarini ishga tushirish
	cd frontend && npm test

clean: ## Kesh va vaqtinchalik fayllarni tozalash
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +


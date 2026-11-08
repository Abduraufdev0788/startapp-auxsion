import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from app.database.session import AsyncSessionLocal, engine
from app.database.base import Base
from app.core.security import get_password_hash
from app.core.constants import UserRole, AuctionStatus, DepositStatus
from app.modules.auth.models import RoleModel, UserRoleModel
from app.modules.users.models import UserModel, UserProfileModel
from app.modules.categories.models import CategoryModel
from app.modules.products.models import ProductModel, ProductImageModel
from app.modules.auctions.models import AuctionModel
from app.modules.participants.models import AuctionParticipantModel
from app.modules.deposits.models import DepositModel
from app.modules.bidding.models import BidModel
from app.core.logging import logger


async def seed_database():
    logger.info("Starting database seeding with Uzbek marketplace demo data...")
    # Ensure tables exist if running on a fresh db
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Seed Roles
        role_names = [role.value for role in UserRole]
        existing_roles = (await db.execute(select(RoleModel))).scalars().all()
        existing_role_names = {r.name for r in existing_roles}

        for r_name in role_names:
            if r_name not in existing_role_names:
                db.add(RoleModel(name=r_name, description=f"{r_name} role"))
        await db.flush()

        # 2. Seed Admin User
        admin_phone = "+998900000001"
        admin = (await db.execute(select(UserModel).where(UserModel.phone == admin_phone))).scalar_one_or_none()
        if not admin:
            admin = UserModel(
                phone=admin_phone,
                email="admin@auctionhub.uz",
                hashed_password=get_password_hash("Admin123!Secure"),
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            await db.flush()
            admin_roles = (await db.execute(select(RoleModel).where(RoleModel.name.in_(["ADMIN", "SUPER_ADMIN"])))).scalars().all()
            for ar in admin_roles:
                db.add(UserRoleModel(user_id=admin.id, role_id=ar.id))
            db.add(UserProfileModel(user_id=admin.id, full_name="Super Administrator"))
            logger.info("Admin user created (+998900000001 / Admin123!Secure)")

        # 3. Seed Seller User
        seller_phone = "+998901234567"
        seller = (await db.execute(select(UserModel).where(UserModel.phone == seller_phone))).scalar_one_or_none()
        if not seller:
            seller = UserModel(
                phone=seller_phone,
                email="istore@auctionhub.uz",
                hashed_password=get_password_hash("Seller123!Secure"),
                is_active=True,
                is_verified=True,
            )
            db.add(seller)
            await db.flush()
            seller_role = (await db.execute(select(RoleModel).where(RoleModel.name == "SELLER"))).scalar_one()
            db.add(UserRoleModel(user_id=seller.id, role_id=seller_role.id))
            db.add(UserProfileModel(user_id=seller.id, full_name="iStore Official (MChJ)"))
            logger.info("Seller user created (+998901234567 / Seller123!Secure)")

        # 4. Seed Buyer Users
        buyer_phone = "+998909876543"
        buyer = (await db.execute(select(UserModel).where(UserModel.phone == buyer_phone))).scalar_one_or_none()
        if not buyer:
            buyer = UserModel(
                phone=buyer_phone,
                email="anvar@auctionhub.uz",
                hashed_password=get_password_hash("Buyer123!Secure"),
                is_active=True,
                is_verified=True,
            )
            db.add(buyer)
            await db.flush()
            user_role = (await db.execute(select(RoleModel).where(RoleModel.name == "USER"))).scalar_one()
            db.add(UserRoleModel(user_id=buyer.id, role_id=user_role.id))
            db.add(UserProfileModel(user_id=buyer.id, full_name="Anvar Karimov"))
            logger.info("Buyer user created (+998909876543 / Buyer123!Secure)")

        # 5. Seed Categories
        cats_data = [
            ("Elektronika", "electronics", "Smartfonlar, noutbuklar va maishiy texnika", "Cpu"),
            ("Avtomobillar", "auto", "Yengil avtomobillar va elektromobillar", "Car"),
            ("Ko'chmas mulk", "realty", "Kvartiralar, uylar va tijorat binolari", "Building"),
            ("San'at va Antikvariat", "art", "Noyob san'at asarlari, tangalar va suratlar", "Palette"),
        ]
        created_cats = {}
        for name, slug, desc, icon in cats_data:
            cat = (await db.execute(select(CategoryModel).where(CategoryModel.slug == slug))).scalar_one_or_none()
            if not cat:
                cat = CategoryModel(
                    name=name,
                    slug=slug,
                    description=desc,
                    icon=icon,
                    display_order=1,
                )
                db.add(cat)
                await db.flush()
            created_cats[slug] = cat

        # 6. Seed Demo Products & Auctions
        now = datetime.now(timezone.utc)
        demo_items = [
            {
                "title": "Apple iPhone 15 Pro Max 256GB Natural Titanium",
                "desc": "Asl nusxa, Dubaydan keltirilgan, LL/A versiya. Qutisi ochilmagan, zavod plyonkasida. 1 yil xalqaro Apple kafolati.",
                "cat": "electronics",
                "image": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80",
                "starting_tiyin": 1000000000, # 10 mln UZS
                "reserve_tiyin": 1400000000, # 14 mln UZS
                "min_inc_tiyin": 10000000, # 100 ming UZS
                "deposit_tiyin": 50000000, # 500 ming UZS
            },
            {
                "title": "Sony PlayStation 5 Digital Edition + 2 ta DualSense",
                "desc": "Original yaponcha versiya, 825GB SSD, qo'shimcha pult va zaryadlash stansiyasi bilan.",
                "cat": "electronics",
                "image": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1000&auto=format&fit=crop&q=80",
                "starting_tiyin": 400000000, # 4 mln UZS
                "reserve_tiyin": 600000000, # 6 mln UZS
                "min_inc_tiyin": 10000000, # 100 ming UZS
                "deposit_tiyin": 30000000, # 300 ming UZS
            },
            {
                "title": "Chevrolet Tracker 2 Premier 2023, 12 000 km",
                "desc": "Holati a'lo darajada, to'liq kraskasiz. Premier komplektatsiya, panorama tom, charm salon.",
                "cat": "auto",
                "image": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1000&auto=format&fit=crop&q=80",
                "starting_tiyin": 19000000000, # 190 mln UZS
                "reserve_tiyin": 21000000000, # 210 mln UZS
                "min_inc_tiyin": 50000000, # 500 ming UZS
                "deposit_tiyin": 1000000000, # 10 mln UZS
            },
        ]

        for item in demo_items:
            existing_prod = (await db.execute(select(ProductModel).where(ProductModel.title == item["title"]))).scalar_one_or_none()
            if not existing_prod:
                prod = ProductModel(
                    seller_id=seller.id,
                    category_id=created_cats[item["cat"]].id,
                    title=item["title"],
                    description=item["desc"],
                    condition="NEW",
                    is_approved=True,
                )
                db.add(prod)
                await db.flush()

                db.add(ProductImageModel(
                    product_id=prod.id,
                    image_url=item["image"],
                    is_primary=True,
                    display_order=1,
                ))

                auc = AuctionModel(
                    seller_id=seller.id,
                    product_id=prod.id,
                    starting_price=item["starting_tiyin"],
                    reserve_price=item["reserve_tiyin"],
                    min_bid_increment=item["min_inc_tiyin"],
                    deposit_amount=item["deposit_tiyin"],
                    current_highest_bid=item["starting_tiyin"],
                    start_time=now - timedelta(hours=2),
                    end_time=now + timedelta(days=3),
                    status=AuctionStatus.ACTIVE.value,
                    delivery_info="O'zbekiston bo'ylab 1-3 ish kunida yetkaziladi.",
                    rules="G'olib 48 soat ichida qolgan summani to'lashi shart.",
                )
                db.add(auc)
                await db.flush()

                # Add buyer participation & deposit for the first auction
                if item["cat"] == "electronics" and "iPhone" in item["title"]:
                    dep = DepositModel(
                        user_id=buyer.id,
                        auction_id=auc.id,
                        amount=auc.deposit_amount,
                        currency="UZS",
                        status=DepositStatus.LOCKED.value,
                    )
                    db.add(dep)
                    await db.flush()

                    db.add(AuctionParticipantModel(
                        auction_id=auc.id,
                        user_id=buyer.id,
                        deposit_id=dep.id,
                        status="ACTIVE",
                    ))

                    # Initial bid
                    bid_amt = auc.starting_price + auc.min_bid_increment
                    db.add(BidModel(
                        auction_id=auc.id,
                        user_id=buyer.id,
                        amount=bid_amt,
                    ))
                    auc.current_highest_bid = bid_amt
                    auc.highest_bidder_id = buyer.id
                    auc.bid_count = 1
                    auc.participant_count = 1

        await db.commit()
        logger.info("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())

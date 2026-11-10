import asyncio
import uuid
import random
from datetime import datetime, timezone, timedelta

# Import all models to register with SQLAlchemy metadata
import app.modules.auth.models
import app.modules.users.models
import app.modules.products.models
import app.modules.categories.models
import app.modules.auctions.models
import app.modules.bidding.models
import app.modules.participants.models
import app.modules.deposits.models
import app.modules.payments.models
import app.modules.escrow.models
import app.modules.refunds.models
import app.modules.settlements.models
import app.modules.deliveries.models
import app.modules.notifications.models
import app.modules.favorites.models
import app.modules.disputes.models
import app.modules.admin.models

from app.database.session import AsyncSessionLocal
from sqlalchemy import select
from app.core.constants import AuctionStatus, ParticipantStatus, DepositStatus
from app.core.security import get_password_hash
from app.modules.users.models import UserModel
from app.modules.categories.models import CategoryModel
from app.modules.products.models import ProductModel, ProductImageModel
from app.modules.auctions.models import AuctionModel, AuctionResultModel
from app.modules.deposits.models import DepositModel
from app.modules.participants.models import AuctionParticipantModel
from app.modules.bidding.models import BidModel

# Sample realistic dataset
CATEGORIES_DATA = [
    {
        "name": "Smartfonlar",
        "slug": "smartfonlar",
        "description": "Smartfonlar, planshetlar va aksessuarlar",
        "icon": "Smartphone"
    },
    {
        "name": "Noutbuklar",
        "slug": "noutbuklar",
        "description": "Noutbuklar, kompyuterlar va monitorlar",
        "icon": "Laptop"
    },
    {
        "name": "Avtotransport",
        "slug": "avtotransport",
        "description": "Avtomobillar, mototexnika va ehtiyot qismlar",
        "icon": "Car"
    },
    {
        "name": "Geyming",
        "slug": "geyming",
        "description": "PlayStation, Xbox, konsollar va geyming jihozlari",
        "icon": "Gamepad2"
    },
    {
        "name": "Hashamat & Soat",
        "slug": "hashamat-soat",
        "description": "Qimmatbaho soatlar, zargarlik buyumlari",
        "icon": "Watch"
    },
    {
        "name": "Maishiy texnika",
        "slug": "maishiy-texnika",
        "description": "Televizorlar, changyutgichlar, kofemashinalar",
        "icon": "Tv"
    },
    {
        "name": "Ko'chmas mulk",
        "slug": "kochmas-mulk",
        "description": "Kvartiralar, noturar joylar va yer uchastkalari",
        "icon": "Home"
    },
    {
        "name": "San'at & Kolleksiya",
        "slug": "sanat-kolleksiya",
        "description": "Rasm asarlari, antiqa buyumlar va nodir tangalar",
        "icon": "Palette"
    },
]

USERS_DATA = [
    ("Sherzod Madaminov", "+998901112233"),
    ("Dilshod Rustamov", "+998902223344"),
    ("Jasur Xolmatov", "+998903334455"),
    ("Otabek Qodirov", "+998904445566"),
    ("Nodir Zokirov", "+998905556677"),
    ("Farrux Jo'rayev", "+998906667788"),
    ("Bobur Yusupov", "+998907778899"),
    ("Sanjar Rahimov", "+998908889900"),
    ("Umid Shokirov", "+998909990011"),
    ("Shavkat Bekmurodov", "+998911112233"),
    ("Temur Saidov", "+998912223344"),
    ("Sardor Qosimov", "+998913334455"),
    ("Aziz Mahmudov", "+998914445566"),
    ("Shahboz Yoqubov", "+998915556677"),
    ("Ulug'bek Oripov", "+998916667788"),
]

PRODUCTS_SPEC = [
    # Smartfonlar (7 ta)
    {
        "cat": "Smartfonlar",
        "title": "Apple iPhone 15 Pro Max 256GB Natural Titanium",
        "desc": "Yangi qutida, rasmiy 1 yillik kafolat. Barcha IMEI ro'yxatdan o'tgan.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
        "start_price": 900000000,
        "reserve_price": 1400000000,
        "increment": 10000000,
        "deposit": 50000000,
    },
    {
        "cat": "Smartfonlar",
        "title": "Samsung Galaxy S24 Ultra 512GB Titanium Gray",
        "desc": "Galaxy AI qo'llab-quvvatlaydigan flagman. Yangi ochilmagan upakovka.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
        "start_price": 850000000,
        "reserve_price": 1350000000,
        "increment": 10000000,
        "deposit": 50000000,
    },
    {
        "cat": "Smartfonlar",
        "title": "Apple iPhone 14 Pro 128GB Deep Purple (Batareya 96%)",
        "desc": "Deyarli yangi holatda, hech qanday tirnalish yo'q. Qutisi va original kabeli bor.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80",
        "start_price": 500000000,
        "reserve_price": 850000000,
        "increment": 10000000,
        "deposit": 30000000,
    },
    {
        "cat": "Smartfonlar",
        "title": "Google Pixel 8 Pro 256GB Bay Blue",
        "desc": "Toza Android, ajoyib kamera va Tensor G3 protsessori. Yangi holatda.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
        "start_price": 600000000,
        "reserve_price": 950000000,
        "increment": 10000000,
        "deposit": 35000000,
    },
    {
        "cat": "Smartfonlar",
        "title": "Xiaomi 14 Ultra 512GB Leica Photography Kit",
        "desc": "Professional kamera kit to'plami bilan birga. Yangi tovar.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1567581935884-3349723552ca?w=800&auto=format&fit=crop&q=80",
        "start_price": 700000000,
        "reserve_price": 1100000000,
        "increment": 10000000,
        "deposit": 40000000,
    },
    {
        "cat": "Smartfonlar",
        "title": "Apple iPad Pro 12.9 M2 256GB Space Gray + Apple Pencil 2",
        "desc": "Grafika va dizayn uchun ajoyib to'plam. Ochilgan quti, ideal holatda.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80",
        "start_price": 650000000,
        "reserve_price": 1050000000,
        "increment": 10000000,
        "deposit": 40000000,
    },
    {
        "cat": "Smartfonlar",
        "title": "OnePlus 12 512GB Emerald Green (16GB RAM)",
        "desc": "Snapdragon 8 Gen 3, Hasselblad kamerasi, 100W tezkor zaryadka.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1511707171634-5f897ff02596?w=800&auto=format&fit=crop&q=80",
        "start_price": 500000000,
        "reserve_price": 800000000,
        "increment": 10000000,
        "deposit": 30000000,
    },

    # Noutbuklar (7 ta)
    {
        "cat": "Noutbuklar",
        "title": "MacBook Air 15 M2 16GB / 512GB Midnight",
        "desc": "Super yengil, kuchli va batareyasi 18 soatgacha yetadigan model.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        "start_price": 800000000,
        "reserve_price": 1300000000,
        "increment": 10000000,
        "deposit": 50000000,
    },
    {
        "cat": "Noutbuklar",
        "title": "Apple MacBook Pro 16 M3 Max 36GB / 1TB Space Black",
        "desc": "Eng kuchli grafik va video montaj noutbuki. 1 yil xalqaro Apple kafolati.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80",
        "start_price": 2000000000,
        "reserve_price": 3400000000,
        "increment": 20000000,
        "deposit": 100000000,
    },
    {
        "cat": "Noutbuklar",
        "title": "ASUS ROG Zephyrus G16 (RTX 4080, i9-14900HX, 32GB)",
        "desc": "Top geymer noutbuki, OLED 240Hz ekran. Yangi qutida.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
        "start_price": 1800000000,
        "reserve_price": 2900000000,
        "increment": 20000000,
        "deposit": 100000000,
    },
    {
        "cat": "Noutbuklar",
        "title": "Lenovo ThinkPad X1 Carbon Gen 11 (Core i7, 32GB, 1TB)",
        "desc": "Biznes va dasturchilar uchun yengil va mustahkam noutbuk.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
        "start_price": 900000000,
        "reserve_price": 1450000000,
        "increment": 10000000,
        "deposit": 50000000,
    },
    {
        "cat": "Noutbuklar",
        "title": "Dell XPS 15 9530 (OLED 3.5K, i7 13-avlod, RTX 4060)",
        "desc": "Yuqori sifatli alyuminiy korpus va betakror ranglar uzatuvchi displey.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
        "start_price": 1200000000,
        "reserve_price": 1900000000,
        "increment": 15000000,
        "deposit": 60000000,
    },
    {
        "cat": "Noutbuklar",
        "title": "Apple Mac Studio M2 Max 32GB / 512GB SSD",
        "desc": "Kompakt ish stansiyasi. Studiya va ofis uchun ideal tanlov.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
        "start_price": 1400000000,
        "reserve_price": 2200000000,
        "increment": 15000000,
        "deposit": 70000000,
    },
    {
        "cat": "Noutbuklar",
        "title": "LG UltraGear 34 240Hz Curved Gaming Monitor",
        "desc": "OLED egri ekran, ajoyib kontrast va 0.03ms javob qaytarish vaqti.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80",
        "start_price": 600000000,
        "reserve_price": 950000000,
        "increment": 10000000,
        "deposit": 30000000,
    },

    # Geyming (6 ta)
    {
        "cat": "Geyming",
        "title": "Sony PlayStation 5 Slim 1TB + 2 ta DualSense",
        "desc": "Oq rangli ixcham PS5 Slim modeli. 2 ta pult va o'yinlar to'plami bilan.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
        "start_price": 350000000,
        "reserve_price": 640000000,
        "increment": 5000000,
        "deposit": 30000000,
    },
    {
        "cat": "Geyming",
        "title": "Xbox Series X 1TB Black Edition",
        "desc": "Eng kuchli 4K 120FPS konsol. Game Pass 3 oylik obunasi bilan.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=80",
        "start_price": 350000000,
        "reserve_price": 590000000,
        "increment": 5000000,
        "deposit": 25000000,
    },
    {
        "cat": "Geyming",
        "title": "Nintendo Switch OLED Mario Red Edition",
        "desc": "Cheklangan qizil nashr. 64GB xotira, OLED ajoyib ekran.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800&auto=format&fit=crop&q=80",
        "start_price": 200000000,
        "reserve_price": 380000000,
        "increment": 5000000,
        "deposit": 15000000,
    },
    {
        "cat": "Geyming",
        "title": "Steam Deck OLED 512GB (Portativ Geyming Kompyuter)",
        "desc": "Steam kutubxonangiz doim yoningizda. 90Hz OLED displey.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
        "start_price": 400000000,
        "reserve_price": 720000000,
        "increment": 10000000,
        "deposit": 30000000,
    },
    {
        "cat": "Geyming",
        "title": "Meta Quest 3 512GB VR Garnitura",
        "desc": "Aralash reallik (MR) va virtual reallik uchun eng zamonaviy shlem.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80",
        "start_price": 450000000,
        "reserve_price": 780000000,
        "increment": 10000000,
        "deposit": 30000000,
    },
    {
        "cat": "Geyming",
        "title": "Logitech G Pro X Superlight 2 Simsiz Sichqoncha + Klaviatura",
        "desc": "Kibersport darajasidagi eng yengil va aniq sensorli to'plam.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
        "start_price": 120000000,
        "reserve_price": 240000000,
        "increment": 2000000,
        "deposit": 10000000,
    },

    # Hashamat & Soat (6 ta)
    {
        "cat": "Hashamat & Soat",
        "title": "Tissot PRX Powermatic 80 Automatic 40mm Moviy Siferblat",
        "desc": "Shveytsariya mexanik soati, 80 soatlik quvvat zaxirasi.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
        "start_price": 300000000,
        "reserve_price": 580000000,
        "increment": 5000000,
        "deposit": 25000000,
    },
    {
        "cat": "Hashamat & Soat",
        "title": "Apple Watch Ultra 2 49mm Titanium GPS + Cellular",
        "desc": "Ekstremal sport va faol hayot tarzi uchun titan korpusli aqlli soat.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop&q=80",
        "start_price": 450000000,
        "reserve_price": 820000000,
        "increment": 10000000,
        "deposit": 35000000,
    },
    {
        "cat": "Hashamat & Soat",
        "title": "Omega Seamaster Diver 300M Co-Axial Master Chronometer",
        "desc": "Afsonaviy Jeyms Bond soati. Keramika korpus, 300 metr suv o'tkazmaydi.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1547996160-71dfabb1a7b1?w=800&auto=format&fit=crop&q=80",
        "start_price": 2500000000,
        "reserve_price": 4500000000,
        "increment": 50000000,
        "deposit": 200000000,
    },
    {
        "cat": "Hashamat & Soat",
        "title": "Tag Heuer Carrera Chronograph Automatic 42mm",
        "desc": "Poyga an'analariga ega Shveytsariya xronografi. Hujjatlari bor.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80",
        "start_price": 1800000000,
        "reserve_price": 3200000000,
        "increment": 30000000,
        "deposit": 150000000,
    },
    {
        "cat": "Hashamat & Soat",
        "title": "Casio G-Shock G-Steel Solar Bluetooth GST-B100",
        "desc": "Zarbalarga chidamli, quyoshdan quvvat oluvchi po'lat erkaklar soati.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&auto=format&fit=crop&q=80",
        "start_price": 150000000,
        "reserve_price": 310000000,
        "increment": 5000000,
        "deposit": 15000000,
    },
    {
        "cat": "Hashamat & Soat",
        "title": "Brilliantli Oltin Uzuk 585 Prob (1.2 Karat H-VS1)",
        "desc": "GIA xalqaro sertifikatiga ega brilliant ko'zli tabiat mo'jizasi.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
        "start_price": 800000000,
        "reserve_price": 1600000000,
        "increment": 20000000,
        "deposit": 80000000,
    },

    # Maishiy texnika (6 ta)
    {
        "cat": "Maishiy texnika",
        "title": "Dyson V15 Detect Absolute Simsiz Changyutgich (Laser Slim)",
        "desc": "Lazerli yoritish va piezo sensorli eng yuqori darajadagi changyutgich.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80",
        "start_price": 400000000,
        "reserve_price": 720000000,
        "increment": 5000000,
        "deposit": 30000000,
    },
    {
        "cat": "Maishiy texnika",
        "title": "DeLonghi Magnifica S Avtomatik Qahva Mashinasi",
        "desc": "Espresso va Cappuccino uchun professional uy kofemashinasi.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80",
        "start_price": 250000000,
        "reserve_price": 460000000,
        "increment": 5000000,
        "deposit": 20000000,
    },
    {
        "cat": "Maishiy texnika",
        "title": "Samsung The Frame 65 QLED 4K Smart TV",
        "desc": "San'at asariga aylanuvchi nozik televizor. Devorga magnit ramka.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80",
        "start_price": 700000000,
        "reserve_price": 1250000000,
        "increment": 10000000,
        "deposit": 50000000,
    },
    {
        "cat": "Maishiy texnika",
        "title": "LG InstaView Door-in-Door No-Frost Ikki Kamerali Muzlatgich",
        "desc": "Shisha eshikni taqillatganda ichi ko'rinadi. Inverter motor 10 yil kafolat.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80",
        "start_price": 900000000,
        "reserve_price": 1650000000,
        "increment": 20000000,
        "deposit": 70000000,
    },
    {
        "cat": "Maishiy texnika",
        "title": "Dyson Supersonic Qora / Nikel Soch quritgich",
        "desc": "Sochni kuydirmasdan tez qurituvchi aqlli harorat sensorli fen.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
        "start_price": 200000000,
        "reserve_price": 390000000,
        "increment": 5000000,
        "deposit": 15000000,
    },
    {
        "cat": "Maishiy texnika",
        "title": "Xiaomi Roborock S8 Pro Ultra Robot-changyutgich",
        "desc": "O'z-o'zini tozalovchi va yuvuvchi stantsiyaga ega aqlli robot.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
        "start_price": 600000000,
        "reserve_price": 1050000000,
        "increment": 10000000,
        "deposit": 40000000,
    },

    # Avtotransport (6 ta)
    {
        "cat": "Avtotransport",
        "title": "Chevrolet Tracker Premier Plus 2024 (Probeg 0 km)",
        "desc": "Salon holatida yangi avtomobil. Qora rang, panoram tom, audio tizim.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80",
        "start_price": 15000000000,
        "reserve_price": 24500000000,
        "increment": 100000000,
        "deposit": 1000000000,
    },
    {
        "cat": "Avtotransport",
        "title": "BYD Song Plus Champion Flagship DM-i 2024",
        "desc": "Gibrid krossover, 1100 km to'liq masofa. To'liq opsiyalar paketi.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80",
        "start_price": 20000000000,
        "reserve_price": 31000000000,
        "increment": 100000000,
        "deposit": 1500000000,
    },
    {
        "cat": "Avtotransport",
        "title": "Vespa Primavera 150 Sean Wotherspoon Edition",
        "desc": "Kolleksion rang-barang dizayn, 150cc tejamkor va nafis skuter.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80",
        "start_price": 2500000000,
        "reserve_price": 4600000000,
        "increment": 25000000,
        "deposit": 150000000,
    },
    {
        "cat": "Avtotransport",
        "title": "Michelin Pilot Sport 5 R19 Shinalar To'plami (4 dona)",
        "desc": "Fransiya original shinalari, ajoyib ushlanish va uzoq umr.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80",
        "start_price": 500000000,
        "reserve_price": 880000000,
        "increment": 10000000,
        "deposit": 40000000,
    },
    {
        "cat": "Avtotransport",
        "title": "DJI Mavic 3 Pro Cine Premium Drone",
        "desc": "Avtomobillar poygasi va video roliklar olish uchun 3 ta kamerali dron.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80",
        "start_price": 1500000000,
        "reserve_price": 2400000000,
        "increment": 20000000,
        "deposit": 100000000,
    },
    {
        "cat": "Avtotransport",
        "title": "BMW M Performance R20 Original Diskalari",
        "desc": "G30 / G20 modellari uchun yengil qotishmali original disklar.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80",
        "start_price": 900000000,
        "reserve_price": 1600000000,
        "increment": 15000000,
        "deposit": 60000000,
    },

    # Ko'chmas mulk (6 ta)
    {
        "cat": "Ko'chmas mulk",
        "title": "Toshkent City 'Nest One' Panoramali 2 Xonali Kvartira",
        "desc": "42-qavat, shahar manzarasi. To'liq dizaynerlik ta'miri bilan.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80",
        "start_price": 80000000000,
        "reserve_price": 140000000000,
        "increment": 500000000,
        "deposit": 5000000000,
    },
    {
        "cat": "Ko'chmas mulk",
        "title": "Bo'stonliq (Chorvoq) Zamonaviy Dacha Kotteji (6 sotix)",
        "desc": "Tog' manzarasi, qishki va yozgi basseyn, sauna va barbekyu zonasi.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
        "start_price": 60000000000,
        "reserve_price": 110000000000,
        "increment": 500000000,
        "deposit": 4000000000,
    },
    {
        "cat": "Ko'chmas mulk",
        "title": "Mirobod Avenue Biznes Markazida Ofis Xonasi (85 kv.m)",
        "desc": "A-klass biznes markaz, yerosti avtoturargohi, 24/7 qorovullik.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80",
        "start_price": 75000000000,
        "reserve_price": 130000000000,
        "increment": 500000000,
        "deposit": 4000000000,
    },
    {
        "cat": "Ko'chmas mulk",
        "title": "Yunusobod 19-mavze 3 Xonali Kvartira (78 kv.m, Evrota'mir)",
        "desc": "Metro bekati yaqinida, barcha mebel va maishiy texnikasi bilan.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
        "start_price": 45000000000,
        "reserve_price": 75000000000,
        "increment": 300000000,
        "deposit": 2500000000,
    },
    {
        "cat": "Ko'chmas mulk",
        "title": "Qibray Tumanida 8 Sotixli Yangi Hovli Uy",
        "desc": "Tinch va ekologik toza hudud. Gaz, suv, svet uzluksiz.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80",
        "start_price": 55000000000,
        "reserve_price": 95000000000,
        "increment": 400000000,
        "deposit": 3000000000,
    },
    {
        "cat": "Ko'chmas mulk",
        "title": "Samarqand Registon Yaqinida Mehmonxona Binosi (12 nomer)",
        "desc": "Sayyohlik zonasida joylashgan tayyor daromadli biznes obyekti.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80",
        "start_price": 90000000000,
        "reserve_price": 160000000000,
        "increment": 500000000,
        "deposit": 5000000000,
    },

    # San'at & Kolleksiya (6 ta)
    {
        "cat": "San'at & Kolleksiya",
        "title": "O'zbekiston Xalq Rassomi Asari: 'Bahor Nafasi' (Moybo'yoq)",
        "desc": "Haqiqiy san'at durdonasi. Kanop matoga moybo'yoqda chizilgan 120x80cm.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
        "start_price": 500000000,
        "reserve_price": 1200000000,
        "increment": 10000000,
        "deposit": 40000000,
    },
    {
        "cat": "San'at & Kolleksiya",
        "title": "Samarqand Qadimiy Ipak Gilami (Qo'lda to'qilgan, 1968 yil)",
        "desc": "Tabiiy bo'yoqlar va toza ipak tolalari. Kolleksionerlar uchun noyob buyum.",
        "condition": "LIKE_NEW",
        "img": "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=80",
        "start_price": 800000000,
        "reserve_price": 1800000000,
        "increment": 20000000,
        "deposit": 70000000,
    },
    {
        "cat": "San'at & Kolleksiya",
        "title": "Buxoro Amirligi Kumush Tangalari To'plami (Tanga, 1895-1910)",
        "desc": "10 dona original kumush tanga, ajoyib saqlangan holatda.",
        "condition": "USED",
        "img": "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80",
        "start_price": 300000000,
        "reserve_price": 650000000,
        "increment": 5000000,
        "deposit": 25000000,
    },
    {
        "cat": "San'at & Kolleksiya",
        "title": "Qo'lda O'yilgan Yong'oq Yog'ochli Qur'on Lavhi (Ustaxonasi Xiva)",
        "desc": "Bir butun yong'oq yog'ochidan ustalar tomonidan naqshlangan durdona.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
        "start_price": 200000000,
        "reserve_price": 420000000,
        "increment": 5000000,
        "deposit": 15000000,
    },
    {
        "cat": "San'at & Kolleksiya",
        "title": "Rishton Kulolchilik San'atining Antik Choynak va Piyolalar To'plami",
        "desc": "Ishqor sir bilan qoplangan ko'k feruza rishton sopoli.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80",
        "start_price": 150000000,
        "reserve_price": 310000000,
        "increment": 3000000,
        "deposit": 10000000,
    },
    {
        "cat": "San'at & Kolleksiya",
        "title": "Chust Pichoqchilik San'ati: Damashq Po'latidan Qo'l Mehnati Pichoq",
        "desc": "Qadimiy damashq po'lati, suyuk dasta va kumush qirqma naqshlar.",
        "condition": "NEW",
        "img": "https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=800&auto=format&fit=crop&q=80",
        "start_price": 250000000,
        "reserve_price": 520000000,
        "increment": 5000000,
        "deposit": 20000000,
    },
]


async def seed():
    print("🌱 Lotly ma'lumotlar bazasini to'ldirish boshlandi...")
    async with AsyncSessionLocal() as session:
        # 1. Categories
        cat_map = {}
        for cdata in CATEGORIES_DATA:
            stmt = select(CategoryModel).where(
                (CategoryModel.name == cdata["name"]) | (CategoryModel.slug == cdata["slug"])
            )
            res = (await session.execute(stmt)).scalars().first()
            if not res:
                res = CategoryModel(
                    name=cdata["name"],
                    slug=cdata["slug"],
                    description=cdata["description"],
                    icon=cdata["icon"],
                    display_order=len(cat_map) + 1,
                )
                session.add(res)
                await session.flush()
            cat_map[cdata["name"]] = res
        print(f"✅ {len(cat_map)} ta toifa tayyorlandi.")

        # 2. Users & Roles
        from app.modules.users.models import UserProfileModel
        from app.modules.auth.models import RoleModel, UserRoleModel

        role_stmt = select(RoleModel).where(RoleModel.name == "USER")
        user_role = (await session.execute(role_stmt)).scalar_one_or_none()
        if not user_role:
            user_role = RoleModel(name="USER", description="Standard User")
            session.add(user_role)
            await session.flush()

        created_users = []
        pwd_hash = get_password_hash("Password123!")
        for full_name, phone in USERS_DATA:
            stmt = select(UserModel).where(UserModel.phone == phone)
            user = (await session.execute(stmt)).scalar_one_or_none()
            if not user:
                user = UserModel(
                    phone=phone,
                    hashed_password=pwd_hash,
                    is_active=True,
                    is_verified=True,
                )
                session.add(user)
                await session.flush()

                profile = UserProfileModel(
                    user_id=user.id,
                    full_name=full_name,
                    city="Toshkent",
                )
                session.add(profile)

                ur = UserRoleModel(user_id=user.id, role_id=user_role.id)
                session.add(ur)
                await session.flush()
            created_users.append(user)
        print(f"✅ {len(created_users)} ta foydalanuvchi tayyorlandi.")

        # 3. Auctions & Products (50+ items)
        now = datetime.now(timezone.utc)
        auctions_created = 0

        for i, spec in enumerate(PRODUCTS_SPEC):
            cat = cat_map.get(spec["cat"])
            if not cat:
                continue

            seller = random.choice(created_users)

            # Check if product already exists
            stmt = select(ProductModel).where(ProductModel.title == spec["title"])
            prod = (await session.execute(stmt)).scalar_one_or_none()
            if not prod:
                prod = ProductModel(
                    seller_id=seller.id,
                    category_id=cat.id,
                    title=spec["title"],
                    description=spec["desc"],
                    condition=spec["condition"],
                    is_approved=True,
                )
                session.add(prod)
                await session.flush()

                # Add image
                img = ProductImageModel(
                    product_id=prod.id,
                    image_url=spec["img"],
                    is_primary=True,
                    display_order=1,
                )
                session.add(img)
                await session.flush()

            # Check if auction already exists for this product
            stmt = select(AuctionModel).where(AuctionModel.product_id == prod.id)
            auc = (await session.execute(stmt)).scalar_one_or_none()
            if not auc:
                # Decide status: 38 ACTIVE, 8 COMPLETED, 4 SCHEDULED
                if i < 38:
                    status = AuctionStatus.ACTIVE.value
                    start_time = now - timedelta(hours=random.randint(2, 48))
                    end_time = now + timedelta(hours=random.randint(4, 120))
                elif i < 46:
                    status = AuctionStatus.COMPLETED.value
                    start_time = now - timedelta(days=random.randint(5, 15))
                    end_time = now - timedelta(hours=random.randint(2, 48))
                else:
                    status = AuctionStatus.SCHEDULED.value
                    start_time = now + timedelta(hours=random.randint(6, 24))
                    end_time = start_time + timedelta(days=random.randint(3, 7))

                auc = AuctionModel(
                    seller_id=seller.id,
                    product_id=prod.id,
                    starting_price=spec["start_price"],
                    reserve_price=spec["reserve_price"],
                    min_bid_increment=spec["increment"],
                    deposit_amount=spec["deposit"],
                    current_highest_bid=spec["start_price"],
                    start_time=start_time,
                    end_time=end_time,
                    status=status,
                    delivery_info="O'zbekiston bo'ylab 24 soat ichida kuryer orqali yetkazib beriladi.",
                    rules="Takliflar majburiy. Depozit kafolatlangan.",
                )
                session.add(auc)
                await session.flush()

                # Add participants and bids for ACTIVE and COMPLETED auctions
                if status in (AuctionStatus.ACTIVE.value, AuctionStatus.COMPLETED.value):
                    potential_bidders = [u for u in created_users if u.id != seller.id]
                    num_participants = random.randint(3, min(8, len(potential_bidders)))
                    selected_bidders = random.sample(potential_bidders, num_participants)

                    cur_price = spec["start_price"]
                    last_bidder = None
                    bid_count = 0

                    for bidder in selected_bidders:
                        # Create deposit
                        dep = DepositModel(
                            user_id=bidder.id,
                            auction_id=auc.id,
                            amount=spec["deposit"],
                            status=DepositStatus.PAID.value if status == AuctionStatus.ACTIVE.value else DepositStatus.REFUNDED.value,
                            provider_ref=f"PAYME-{uuid.uuid4().hex[:12].upper()}",
                        )
                        session.add(dep)
                        await session.flush()

                        # Create participant
                        part = AuctionParticipantModel(
                            auction_id=auc.id,
                            user_id=bidder.id,
                            deposit_id=dep.id,
                            status=ParticipantStatus.ELIGIBLE.value,
                        )
                        session.add(part)
                        await session.flush()

                        # Place 1-3 bids per participant
                        for _ in range(random.randint(1, 3)):
                            cur_price += spec["increment"] * random.randint(1, 3)
                            bid = BidModel(
                                auction_id=auc.id,
                                user_id=bidder.id,
                                amount=cur_price,
                            )
                            session.add(bid)
                            last_bidder = bidder
                            bid_count += 1

                    auc.current_highest_bid = cur_price
                    auc.highest_bidder_id = last_bidder.id if last_bidder else None
                    auc.participant_count = num_participants
                    auc.bid_count = bid_count

                    # If completed, create AuctionResultModel
                    if status == AuctionStatus.COMPLETED.value and last_bidder:
                        result = AuctionResultModel(
                            auction_id=auc.id,
                            winner_id=last_bidder.id,
                            winning_bid=cur_price,
                            payment_deadline=now + timedelta(hours=48),
                            payment_status="PAID",
                        )
                        session.add(result)

                auctions_created += 1

        await session.commit()
        print(f"🎉 Barcha 50 ta auksion va bog'liq ma'lumotlar muvaffaqiyatli saqlandi! ({auctions_created} yangi auksion qo'shildi)")


if __name__ == "__main__":
    asyncio.run(seed())

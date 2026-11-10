import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  Car,
  Smartphone,
  Building,
  Palette,
  Gem,
  Store,
  TrendingUp,
  PlusCircle,
  HelpCircle,
  ChevronDown,
  Award,
  Wallet,
  Check,
  Lock,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import { useLanguage } from '../context/LanguageContext';
import { auctionsService, categoriesService, getMediaUrl } from '../services/api';
import { Auction, Category } from '../types';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [homeSearch, setHomeSearch] = useState('');
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'featured' | 'ending_soon' | 'newest'>('featured');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Fallback featured items when backend has few or no items
  const fallbackAuctions = [
    {
      id: 'fallback-001',
      title: 'Chevrolet Tracker 2 Premier 2023, 12 000 km',
      category: 'Avtomobillar',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
      currentHighestBid: 19100000000,
      depositAmount: 1000000000,
      participants: 14,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
      condition: 'Yangi',
    },
    {
      id: 'fallback-002',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      category: 'Smartfonlar',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      currentHighestBid: 1450000000,
      depositAmount: 50000000,
      participants: 23,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
      condition: 'Yangi',
    },
    {
      id: 'fallback-003',
      title: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
      category: 'Geyming',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
      currentHighestBid: 620000000,
      depositAmount: 30000000,
      participants: 9,
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
      condition: 'Yangi',
    },
  ];

  // Visual Category presets with custom icons & gradients
  const categoryShowcase = [
    {
      id: 'auto',
      title: 'Avtomobillar',
      desc: 'Yengil avtolar, elektromobillar va mototexnika',
      icon: <Car className="w-6 h-6 text-emerald-500" />,
      color: 'from-emerald-500/10 to-teal-500/10 hover:border-emerald-500/50',
      searchKey: 'auto',
    },
    {
      id: 'electronics',
      title: 'Elektronika & Gadjetlar',
      desc: "Smartfonlar, noutbuklar va o'yin pristavkalari",
      icon: <Smartphone className="w-6 h-6 text-blue-500" />,
      color: 'from-blue-500/10 to-indigo-500/10 hover:border-blue-500/50',
      searchKey: 'electronics',
    },
    {
      id: 'realty',
      title: "Ko'chmas Mulk",
      desc: 'Kvartiralar, noturar joylar va kottejlar',
      icon: <Building className="w-6 h-6 text-amber-500" />,
      color: 'from-amber-500/10 to-orange-500/10 hover:border-amber-500/50',
      searchKey: 'realty',
    },
    {
      id: 'art',
      title: "San'at & Antikvariat",
      desc: 'Noyob kartinalar, tangalar va kolleksiyalar',
      icon: <Palette className="w-6 h-6 text-purple-500" />,
      color: 'from-purple-500/10 to-pink-500/10 hover:border-purple-500/50',
      searchKey: 'art',
    },
    {
      id: 'luxury',
      title: 'Zargarlik & Soatlar',
      desc: 'Qimmatbaho taqinchoqlar va shveytsariya soatlari',
      icon: <Gem className="w-6 h-6 text-rose-500" />,
      color: 'from-rose-500/10 to-red-500/10 hover:border-rose-500/50',
      searchKey: 'luxury',
    },
    {
      id: 'all',
      title: 'Barcha Lotlar',
      desc: "Platformadagi barcha faol savdolarni ko'rish",
      icon: <Store className="w-6 h-6 text-teal-500" />,
      color: 'from-teal-500/10 to-emerald-500/10 hover:border-teal-500/50',
      searchKey: '',
    },
  ];

  // Quick Trending Search Pills
  const trendingTags = [
    'Chevrolet Tracker',
    'iPhone 15 Pro',
    'PlayStation 5',
    'MacBook Air',
    'Kvartira',
    'Antikvariat',
  ];

  // FAQ Items
  const faqList = [
    {
      q: "Kafolat depoziti nima va auksionda yutqazsam u qaytariladimi?",
      a: "Ha, 100% to'liq qaytariladi! Kafolat depoziti faqatgina savdoda qatnashuvchilarning jiddiyligini tasdiqlash uchun xizmat qiladi. Agar siz auksionda yuta olmasangiz, depozitingiz zudlik bilan shaxsiy hisob-balansingizga qaytariladi va uni bir zumda bank kartangizga yechib olishingiz mumkin."
    },
    {
      q: "Auksionda g'olib bo'lsam, to'lov va tovar qanday amalga oshiriladi?",
      a: "G'olib bo'lganingizda siz to'lagan depozit summasi tovarning umumiy narxiga hisoblanadi. Siz belgilangan muddat ichida qolgan qoldiq summani kabinetingiz orqali to'laysiz, shundan so'ng sotuvchi mahsulotni kuryer yoki kelishilgan manzil orqali yetkazib beradi."
    },
    {
      q: "Sotuvchi o'z auksionida qatnashishi yoki narxni sun'iy ko'tarishi mumkinmi?",
      a: "Mutlaqo mumkin emas! Lotly platformasi server darajasida qat'iy tekshiruvlarga ega. Sotuvchi o'z auksionida qatnasha olmaydi, barcha IP va foydalanuvchi hisoblari qattiq nazorat qilinadi."
    },
    {
      q: "Hisobimdagi mablag'ni bank kartamga qanday chiqarib olaman?",
      a: "Shaxsiy kabinetingizdagi 'Balans & Hisob' bo'limida 'Chiqarib olish' tugmasini bosib, istalgan Uzcard yoki Humo kartangiz raqamini kiritasiz. So'rov admin tomonidan tekshirilib, pul kartangizga o'tkazib beriladi."
    },
    {
      q: "Lotly auksionida qanday qilib o'z mahsulotimni sotuvga qo'yishim mumkin?",
      a: "Tizimdan ro'yxatdan o'tgach, 'Yangi lot joylash' tugmasini bosasiz. Mahsulot nomi, rasmlari, boshlang'ich narxi va auksion muddatini belgilab tasdiqlaysiz. Moderatsiyadan o'tgach, lotingiz jonli savdoga chiqadi."
    }
  ];

  useEffect(() => {
    // Load live auctions
    auctionsService
      .list({ status: 'ACTIVE' })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setActiveAuctions(res.items);
        }
      })
      .catch(() => {});

    // Load categories
    categoriesService
      .list()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(homeSearch.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/dashboard?search=${encodeURIComponent(tag)}`);
  };

  const handleCategoryClick = (searchKey: string) => {
    if (!searchKey) {
      navigate('/dashboard');
      return;
    }
    const matchedCategory = categories.find(
      (c) => c.slug?.toLowerCase().includes(searchKey.toLowerCase()) || c.name.toLowerCase().includes(searchKey.toLowerCase())
    );
    if (matchedCategory) {
      navigate(`/dashboard?category=${matchedCategory.id}`);
    } else {
      navigate(`/dashboard?search=${encodeURIComponent(searchKey)}`);
    }
  };

  // Filter auctions for display based on active tab
  const displayAuctions = activeAuctions.length > 0 ? activeAuctions : null;

  const sortedAuctions = displayAuctions
    ? [...displayAuctions].sort((a, b) => {
        if (activeTab === 'ending_soon') {
          return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
        }
        if (activeTab === 'newest') {
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        }
        // default featured: most participants or bids
        return (b.participant_count || 0) - (a.participant_count || 0);
      })
    : [];

  // Hero showcase auction (real or fallback)
  const heroAuction = activeAuctions[0] || null;

  return (
    <div className="space-y-24 pb-20 overflow-x-hidden">
      {/* ================= 1. PRO HERO SECTION ================= */}
      <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
        {/* Ambient Glowing Background Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-emerald-500/20 via-teal-400/10 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline, Search, and CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Trust Pill Badge */}
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shadow-sm backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>✨ Lotly — O'zbekistondagi №1 Kafolatli Jonli Auksion Maydoni</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                {t.home.heroTitle1}{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                  {t.home.heroTitle2}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {t.home.heroDesc || "Lotly orqali eksklyuziv tovarlar, avtomobillar va elektronika savdosida qatnashing. 100% qaytariluvchi depozit va bank darajasidagi xavfsiz kafolat."}
              </p>

              {/* Pro Search Bar */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-emerald-950/10 border border-slate-200/90 dark:border-slate-800 p-1.5 focus-within:ring-2 focus-within:ring-emerald-500 transition-all"
                >
                  <div className="flex-1 flex items-center pl-3 sm:pl-4">
                    <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                      placeholder={t.home.searchPlaceholder || "Lot nomi yoki parametr bo'yicha qidiring..."}
                      className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="md"
                    className="rounded-xl px-4 sm:px-6 font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 shrink-0"
                  >
                    <span>{t.common.search || 'Qidirish'}</span>
                  </Button>
                </form>

                {/* Popular Trending Tags */}
                <div className="mt-3 flex items-center justify-center lg:justify-start gap-1.5 flex-wrap text-xs text-slate-500">
                  <span className="font-semibold text-slate-400 text-[11px] mr-1">Ommabop:</span>
                  {trendingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:hover:text-emerald-400 text-[11px] font-medium transition-colors"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full font-bold px-7 shadow-lg shadow-emerald-600/30 text-sm">
                    <Gavel className="w-4 h-4 mr-2" />
                    {t.home.exploreBtn || "Auksionlarni ko'rish"}
                  </Button>
                </Link>
                <Link to={isAuthenticated ? '/dashboard?openModal=true' : '/register'} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full font-bold px-6 text-sm">
                    <PlusCircle className="w-4 h-4 mr-2 text-emerald-600" />
                    {t.home.sellBtn || "Mahsulot sotish"}
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Live Interactive Lot Showcase Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md group">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-500 opacity-25 group-hover:opacity-40 blur-xl transition duration-500" />

                <Card className="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                  {/* Top Live Banner */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200/80 dark:border-red-900 text-red-600 dark:text-red-400 text-[11px] font-black">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      <span>JONLI SAVDO (LIVE)</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>Tugash vaqti:</span>
                    </div>
                  </div>

                  {/* Image Preview & Live Timer Pill */}
                  <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        heroAuction
                          ? getMediaUrl(heroAuction.product?.images?.[0]?.image_url)
                          : fallbackAuctions[0].imageUrl
                      }
                      alt={heroAuction?.product?.title || fallbackAuctions[0].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="backdrop-blur-md bg-slate-900/85 text-white rounded-xl px-3 py-1.5 text-xs font-black flex items-center space-x-1.5 shadow-lg border border-white/10">
                        <CountdownTimer
                          targetDate={heroAuction?.end_time || fallbackAuctions[0].endTime}
                          variant="compact"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 backdrop-blur-md bg-slate-900/80 rounded-xl px-3 py-2 text-white flex items-center justify-between border border-white/10">
                      <div className="flex items-center space-x-1.5 text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold text-emerald-300">
                          {heroAuction?.participant_count || fallbackAuctions[0].participants} nafar ishtirokchi
                        </span>
                      </div>
                      <Badge variant="success" className="text-[10px] uppercase font-bold">
                        Faol savdo
                      </Badge>
                    </div>
                  </div>

                  {/* Details & Current Bid */}
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                      {heroAuction?.product?.title || fallbackAuctions[0].title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {heroAuction?.product?.description || "Rasmiy kafolat, ideal holatda, to'liq komplekt."}
                    </p>

                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Joriy eng yuqori taklif:
                        </span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          {formatUZS(
                            heroAuction?.current_highest_bid ||
                            heroAuction?.starting_price ||
                            fallbackAuctions[0].currentHighestBid
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          Depozit:
                        </span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatUZS(heroAuction?.deposit_amount || fallbackAuctions[0].depositAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={heroAuction ? `/auctions/${heroAuction.id}` : '/dashboard'}
                    className="block pt-1"
                  >
                    <Button size="md" className="w-full font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 text-xs flex items-center justify-center space-x-1.5">
                      <Gavel className="w-4 h-4 mr-1.5" />
                      <span>Taklif kiritish (Savdoga qo'shilish)</span>
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <Gavel className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">5 000+</div>
                <div className="text-xs text-slate-500 font-medium">Muvaffaqiyatli savdolar</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">100%</div>
                <div className="text-xs text-slate-500 font-medium">Depozit qaytarish kafolati</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">0.1 sek</div>
                <div className="text-xs text-slate-500 font-medium">WebSocket tezligi</div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">24/7</div>
                <div className="text-xs text-slate-500 font-medium">Bank darajasida xavfsizlik</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. POPULAR CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Yo'nalishlar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Ommabop Toifalar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              O'zingizga qiziq bo'lgan sohani tanlang va tegishli auksionlarni saralang
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center"
          >
            Barcha toifalarni ko'rish <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryShowcase.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.searchKey)}
              className={`p-4 rounded-3xl bg-gradient-to-b ${cat.color} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-left flex flex-col justify-between group cursor-pointer`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ================= 3. FEATURED LIVE AUCTIONS WITH TABS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Jonli Auksionlar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.home.featuredTitle || "Faol Savdodagi Lotlar"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t.home.featuredSubtitle || "Hozirda eng qizg'in narx talashuvi kechayotgan mashhur lotlar"}
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'featured'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              🔥 Ommabop
            </button>
            <button
              onClick={() => setActiveTab('ending_soon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ending_soon'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ⏱️ Shoshilinch
            </button>
            <button
              onClick={() => setActiveTab('newest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'newest'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              ✨ Yangi
            </button>
          </div>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAuctions.length > 0
            ? sortedAuctions.slice(0, 6).map((item) => {
                const img = getMediaUrl(item.product?.images?.[0]?.image_url);
                return (
                  <Card
                    key={item.id}
                    className="group flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={img}
                        alt={item.product?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="backdrop-blur-md bg-slate-950/80 text-white rounded-xl px-3 py-1.5 text-xs font-black flex items-center shadow-lg border border-white/10">
                          <CountdownTimer targetDate={item.end_time} variant="compact" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="neutral" className="bg-slate-950/70 text-white border-none backdrop-blur-md text-[11px] font-bold">
                          {item.product?.condition === 'NEW' ? 'YANGI' : 'Deyarli yangi'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg backdrop-blur-md bg-slate-950/70 text-emerald-400 text-[11px] font-semibold border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                          {item.participant_count || 0} ishtirokchi
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-base line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {item.product?.title}
                        </h3>

                        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Joriy narx:
                            </span>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                              {formatUZS(item.current_highest_bid || item.starting_price)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Depozit:
                            </span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {formatUZS(item.deposit_amount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link to={`/auctions/${item.id}`} className="block">
                          <Button size="md" className="w-full font-bold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-600/15">
                            <Gavel className="w-3.5 h-3.5 mr-1.5" />
                            <span>{t.auctions.bidBtn || "Taklif kiritish"}</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })
            : fallbackAuctions.map((item) => (
                <Card
                  key={item.id}
                  className="group flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <div className="backdrop-blur-md bg-slate-950/80 text-white rounded-xl px-3 py-1.5 text-xs font-black flex items-center shadow-lg border border-white/10">
                        <CountdownTimer targetDate={item.endTime} variant="compact" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="neutral" className="bg-slate-950/70 text-white border-none backdrop-blur-md text-[11px] font-bold">
                        {item.condition}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-base line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>

                      <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Joriy narx:
                          </span>
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {formatUZS(item.currentHighestBid)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                            Depozit:
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {formatUZS(item.depositAmount)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Link to="/dashboard" className="block">
                        <Button size="md" className="w-full font-bold text-xs py-2.5 rounded-xl shadow-md shadow-emerald-600/15">
                          <Gavel className="w-3.5 h-3.5 mr-1.5" />
                          <span>{t.auctions.bidBtn || "Taklif kiritish"}</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
        </div>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="font-bold px-8 rounded-2xl shadow-sm text-sm">
              <span>{t.home.viewAllAuctions || "Barcha auksionlarni ko'rish"}</span>
              <ArrowRight className="w-4 h-4 ml-2 text-emerald-600" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ================= 4. WHY LOTLY (PLATFORM CORE ADVANTAGES) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Kafolat va Xavfsizlik</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Nega Aynan Lotly Platformasi?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Biz auksion savdolarini qonuniy, shaffof va har bir ishtirokchi uchun moliyaviy himoyalangan qildik
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              100% Qaytariluvchi Depozit
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yutqazilgan auksionlarda kafolat depoziti darhol 100% foydalanuvchi balansiga qaytariladi va kartaga to'liq chiqarib beriladi.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center font-bold">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              0.1s Jonli WebSocket Savdo
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hech qanday sahifani yangilash shart emas. Har bir kiritilgan taklif real vaqtda butun dunyo bo'ylab barcha ishtirokchilarga ko'rinadi.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
              <Wallet className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Ikki Tomonlama Ledger Balans
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Moliyaviy hisob-kitoblar bank darajasidagi double-entry ledger tizimi orqali har bir tiyinigacha aniq va xatosiz yuritiladi.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Rasmiy Shartnoma & Eskiz SMS
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Barcha harakatlar, yutuqlar va to'lovlar SMS xabarnomalar orqali tasdiqlanadi va huquqiy me'yorlar asosida himoyalanadi.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 5. HOW IT WORKS (STEP BY STEP) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="info" className="mb-2 font-bold uppercase tracking-wider text-[11px]">
            {t.common.appName || "Lotly"}
          </Badge>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            {t.home.howItWorksTitle || "Qanday ishlaydi?"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            {t.home.howItWorksSubtitle || "Lotly platformasi 4 ta oddiy va xavfsiz qadamdan iborat"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                1
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step1Title || "1. Ro'yxatdan o'ting"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step1Desc || "Telefon raqamingiz orqali soniyalar ichida ro'yxatdan o'ting va shaxsiy hisobingizga kiring."}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                2
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step2Title || "2. Kafolat depoziti to'lang"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step2Desc || "O'zingizga yoqqan lotni tanlang va qatnashish uchun qaytariladigan kafolat depozitini to'lang."}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                3
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step3Title || "3. Narx taklifini bering"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step3Desc || "Raqobatchilardan balandroq narx taklif qiling va auksion tugashini jonli kuzating."}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-sm hover:border-emerald-500 transition-colors">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xl mb-4 shadow-sm">
                4
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step4Title || "4. Mahsulotni qabul qiling"}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step4Desc || "Yutsangiz qolgan summani to'lab buyumni oling. Yutqazsangiz depozit 100% hisobingizga qaytadi."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. FOR SELLERS SPLIT SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sotuvchilar uchun imkoniyat</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Mahsulotingizni Eng Yuqori Bozor Narxida Soting
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Nega oddiy e'lonlar emas, aynan auksion? Chunki jonli raqobat tovaringizning haqiqiy narxini oshiradi, ishtirokchilar depozit to'lagani uchun esa soxta xaridorlar yo'q!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xl font-black text-emerald-400">0 so'm</div>
                  <div className="text-[11px] text-slate-300 mt-1">E'lon berish bepul</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xl font-black text-emerald-400">+25% gacha</div>
                  <div className="text-[11px] text-slate-300 mt-1">Narx oshish ehtimoli</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-xl font-black text-emerald-400">100%</div>
                  <div className="text-[11px] text-slate-300 mt-1">Jiddiy xaridorlar</div>
                </div>
              </div>

              <div className="pt-2">
                <Link to={isAuthenticated ? '/dashboard?openModal=true' : '/register'}>
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 shadow-lg shadow-emerald-500/25 text-sm">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    <span>Yangi auksion e'lon qilish</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm p-6 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/15 space-y-4 text-left shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Shaffof va Tezkor Savdo</h4>
                    <p className="text-[11px] text-emerald-300">Belgilangan vaqtda yakunlanadi</p>
                  </div>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Boshlang'ich va minimal sotish narxini o'zingiz belgilaysiz</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Xaridorlar oldindan kafolat depozitini to'laydi</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Barcha takliflar va ishtirokchilar jonli ko'rinadi</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 7. INTERACTIVE FAQ ACCORDION ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Savollarga Javoblar</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Ko'p Beriladigan Savollar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Platformadan foydalanish, to'lovlar va depozit qaytarilishi bo'yicha eng muhim ma'lumotlar
          </p>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= 8. FINAL BIG CTA BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Bugunoq Lotly Auksionlarida Qatnashing!
            </h2>
            <p className="text-sm sm:text-base text-emerald-100 leading-relaxed font-medium">
              Eksklyuziv lotlar uchun jonli savdoda bellashing yoki o'z mahsulotingizni kafolatlangan xaridorlarga soting.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-8 shadow-xl text-sm">
                  <Gavel className="w-4 h-4 mr-2" />
                  <span>Auksionlar bozoriga kirish</span>
                </Button>
              </Link>
              {!isAuthenticated && (
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white/60 hover:bg-white/10 font-bold px-8 text-sm">
                    <span>Ro'yxatdan o'tish</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

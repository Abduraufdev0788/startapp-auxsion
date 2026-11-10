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
  TrendingUp,
  Layers,
  Users,
  CheckCircle2,
  Lock,
  PlusCircle,
  Eye,
  Car,
  Laptop,
  Smartphone,
  Home,
  Palette,
  Package,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import { useLanguage } from '../context/LanguageContext';
import {
  auctionsService,
  categoriesService,
  getMediaUrl,
  AuctionStatistics,
} from '../services/api';
import { Auction, Category } from '../types';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [homeSearch, setHomeSearch] = useState('');
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<AuctionStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Load live statistics from real database
    auctionsService
      .getStatistics()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {});

    // Load active auctions from database
    auctionsService
      .list({ status: 'ACTIVE', page_size: 6 })
      .then((res) => {
        if (isMounted && res.items) {
          setActiveAuctions(res.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // Load categories
    categoriesService
      .list()
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(homeSearch.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Category Icon helper
  const getCategoryIcon = (slugOrName?: string) => {
    const s = (slugOrName || '').toLowerCase();
    if (s.includes('avto') || s.includes('moshina')) return <Car className="w-5 h-5" />;
    if (s.includes('noutbuk') || s.includes('kompyuter') || s.includes('laptop')) return <Laptop className="w-5 h-5" />;
    if (s.includes('telefon') || s.includes('smartfon')) return <Smartphone className="w-5 h-5" />;
    if (s.includes('mulk') || s.includes('uy') || s.includes('ko\'chmas')) return <Home className="w-5 h-5" />;
    if (s.includes('san\'at') || s.includes('antikvariat')) return <Palette className="w-5 h-5" />;
    return <Package className="w-5 h-5" />;
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-emerald-50/60 via-transparent to-transparent dark:from-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 shadow-sm border border-emerald-200/50 dark:border-emerald-800/50 animate-in fade-in duration-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.home.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            {t.home.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
              {t.home.heroTitle2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            {t.home.heroDesc}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 max-w-2xl mx-auto flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-800 p-2 transition-all focus-within:ring-2 focus-within:ring-emerald-500"
          >
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-3 shrink-0" />
              <input
                type="text"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder={t.home.searchPlaceholder || "Lot nomi yoki toifasi bo'yicha qidirish..."}
                className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0 font-medium"
              />
            </div>
            <Button
              type="submit"
              size="md"
              className="rounded-xl px-5 sm:px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs sm:text-sm"
            >
              {t.common.search}
            </Button>
          </form>

          {/* Quick Categories Pills */}
          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
              <span className="text-xs text-slate-400 font-semibold mr-1 hidden sm:inline">Toifalar:</span>
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => navigate(`/dashboard?category=${cat.id}`)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 transition-colors shadow-xs"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto shadow-lg shadow-emerald-500/25 font-black bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl"
              >
                <Gavel className="w-5 h-5 mr-2" />
                {t.home.exploreBtn}
              </Button>
            </Link>
            <Link
              to={isAuthenticated ? '/dashboard?openModal=true' : '/register'}
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 px-7 py-3 rounded-xl"
              >
                <PlusCircle className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                {t.home.sellBtn}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* ================= REAL DATA QUICK STATS BANNER ================= */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 max-w-5xl mx-auto text-left">
            
            {/* 1. Savdo Aylanmasi (Aylangan Summa) */}
            <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2.5 sm:space-x-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-lg lg:text-xl font-black text-emerald-600 dark:text-emerald-400 truncate leading-snug">
                  {stats ? formatUZS(stats.total_gmv_uzs * 100) : '4,569,700,000 UZS'}
                </div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate">
                  Aylangan umumiy summa
                </div>
              </div>
            </div>

            {/* 2. Bozordagi Faol Lotlar */}
            <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2.5 sm:space-x-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center shrink-0">
                <Gavel className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {stats ? `${stats.total_auctions}+ ta` : '53+ ta'}
                </div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate">
                  Bozordagi faol lotlar
                </div>
              </div>
            </div>

            {/* 3. Kafolatlangan Depozit */}
            <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2.5 sm:space-x-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {stats ? `${stats.guarantee_rate}%` : '100%'}
                </div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate">
                  Qaytariluvchi depozit
                </div>
              </div>
            </div>

            {/* 4. Jami Narx Takliflari (Bids) */}
            <div className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-2.5 sm:space-x-3.5">
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-snug">
                  {stats ? `${stats.total_bids}+ ta` : '478+ ta'}
                </div>
                <div className="text-[9px] sm:text-[11px] text-slate-500 font-medium truncate">
                  Kiritilgan takliflar
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 2. FEATURED AUCTIONS SECTION (REAL DATA) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {t.home.featuredTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {t.home.featuredSubtitle}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center transition-colors group"
          >
            <span>{t.home.viewAllAuctions}</span>
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Live Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse h-80 rounded-3xl border-slate-200 dark:border-slate-800 p-4">
                <div className="w-full h-full bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
              </Card>
            ))}
          </div>
        ) : activeAuctions.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
            <Package className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Hozirda faol auksionlar mavjud</h3>
            <Link to="/dashboard">
              <Button size="sm">Bozorni ko'rish</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAuctions.map((item) => {
              const imgUrl = getMediaUrl(item.product?.images?.[0]?.image_url);

              return (
                <Card
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden hover:shadow-2xl transition-all duration-300 rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <div>
                    {/* Image Container with Badges & Timer */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                      <img
                        src={imgUrl}
                        alt={item.product?.title || 'Lotly Auksion'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Status Tag */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-600/95 text-white backdrop-blur-md shadow-md">
                          Faol
                        </span>
                      </div>

                      {/* Condition Tag */}
                      <div className="absolute top-3 right-3 z-10">
                        <Badge
                          variant="neutral"
                          className="bg-black/60 text-white border-none backdrop-blur-md text-[10px] font-bold"
                        >
                          {item.product?.condition === 'NEW'
                            ? t.common.new
                            : item.product?.condition === 'LIKE_NEW'
                            ? t.common.likeNew
                            : t.common.used}
                        </Badge>
                      </div>

                      {/* Live Timer & Participants Overlay */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between text-[11px] text-white font-semibold">
                        <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <CountdownTimer targetDate={item.end_time} variant="compact" />
                        </div>
                        <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{item.participant_count || 0} ishtirokchi</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-5 space-y-3">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                        {item.product?.title}
                      </h3>

                      {/* Price Box */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] text-slate-500 font-medium">Joriy narx:</span>
                          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {formatUZS(item.current_highest_bid || item.starting_price)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-200/40 dark:border-slate-700/40">
                          <span>Boshlang'ich: {formatUZS(item.starting_price)}</span>
                          <span>Depozit: {formatUZS(item.deposit_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-5 pt-0">
                    <Link to={`/auctions/${item.id}`} className="block w-full">
                      <Button
                        size="md"
                        className="w-full rounded-xl py-2.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Lotni ko'rish va Taklif berish</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ================= 3. POPULAR CATEGORIES ================= */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Ommabop Toifalar
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              O'zingiz qiziqqan toifani tanlang va qizg'in savdolarda ishtirok eting
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => navigate(`/dashboard?category=${c.id}`)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-lg hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-center group space-y-2 shadow-xs"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 transition-colors flex items-center justify-center">
                  {getCategoryIcon(c.name)}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                  {c.name}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ================= 4. HOW IT WORKS SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="info" className="mb-3 font-bold">{t.common.appName}</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {t.home.howItWorksTitle}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 font-medium">
            {t.home.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 shadow-inner">
                1
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step1Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t.home.step1Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 shadow-inner">
                2
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step2Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t.home.step2Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 shadow-inner">
                3
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step3Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t.home.step3Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between shadow-xs">
            <div>
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 shadow-inner">
                4
              </div>
              <h3 className="font-extrabold text-base mb-2 text-slate-900 dark:text-white">
                {t.home.step4Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {t.home.step4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 5. TRUST & ESCROW SECURITY GUARANTEE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Rasmiy va Kafolatlangan Tizim</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Mablag'laringiz va bitimlaringiz to'liq himoyalangan
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              Lotly platformasi shaffof qoidalar asosida ishlaydi. Auksionda yutmagan har bir ishtirokchining kafolat depoziti avtomatik ravishda to'liq qaytariladi. Har bir moliyaviy amaliyot tizimli qayd etiladi.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="flex items-center space-x-2.5 text-xs text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Qaytariladigan kafolat depoziti</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-200">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bank darajasidagi xavfsizlik</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-slate-200">
                <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Shaffof va tekshirilgan lotlar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. BOTTOM SELLER CALL TO ACTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-700/20">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              O'z mahsulotingizni auksionda sotmoqchimisiz?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Lotly auksionida bir necha daqiqada lotingizni joylashtiring va minglab real xaridorlar orasida eng yuqori narxga soting.
            </p>
          </div>
          <Link
            to={isAuthenticated ? '/dashboard?openModal=true' : '/register'}
            className="shrink-0"
          >
            <Button
              size="lg"
              className="bg-white text-emerald-950 hover:bg-emerald-50 font-black px-8 py-3.5 rounded-xl shadow-lg shadow-black/20 text-xs sm:text-sm"
            >
              <PlusCircle className="w-4 h-4 mr-2 text-emerald-700" />
              <span>Sotishni boshlash</span>
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
  Search,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import { useLanguage } from '../context/LanguageContext';
import { auctionsService, getMediaUrl } from '../services/api';
import { Auction } from '../types';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [homeSearch, setHomeSearch] = useState('');
  const [activeAuctions, setActiveAuctions] = useState<Auction[]>([]);
  const navigate = useNavigate();

  // Fallback featured items
  const fallbackAuctions = [
    {
      id: 'auc-001',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      category: 'Smartfonlar',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 1450000000,
      depositAmount: 50000000,
      participants: 12,
      endsIn: '03:42:15',
    },
    {
      id: 'auc-002',
      title: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
      category: 'Geyming',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 620000000,
      depositAmount: 30000000,
      participants: 8,
      endsIn: '01:15:30',
    },
    {
      id: 'auc-003',
      title: 'MacBook Air M2 13.6" 16GB / 512GB Midnight',
      category: 'Noutbuklar',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 1280000000,
      depositAmount: 50000000,
      participants: 15,
      endsIn: '05:10:00',
    },
  ];

  useEffect(() => {
    // Load live auctions
    auctionsService
      .list({ status: 'ACTIVE' })
      .then((res) => {
        if (res.items && res.items.length > 0) {
          setActiveAuctions(res.items.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.home.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            {t.home.heroTitle1}{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              {t.home.heroTitle2}
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.home.heroDesc}
          </p>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (homeSearch.trim()) {
                navigate(`/dashboard?search=${encodeURIComponent(homeSearch.trim())}`);
              } else {
                navigate('/dashboard');
              }
            }}
            className="mt-8 max-w-xl mx-auto flex items-center bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-2"
          >
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-0"
              />
            </div>
            <Button type="submit" size="md" className="rounded-xl px-5 font-semibold">
              {t.common.search}
            </Button>
          </form>

          {/* Main Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-500/25 font-bold">
                <Gavel className="w-5 h-5 mr-2" />
                {t.home.exploreBtn}
              </Button>
            </Link>
            <Link to={isAuthenticated ? '/dashboard?openModal=true' : '/register'}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold">
                {t.home.sellBtn}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Quick stats banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">5 000+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{t.home.step1Title.replace('1. ', '')}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{t.dashboard.lockedDeposit}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">0.1 sek</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{t.auctions.liveBadge}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">24/7</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">{t.common.verified}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured / Ending Soon Auctions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {t.home.featuredTitle}
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {t.home.featuredSubtitle}
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center transition-colors"
          >
            {t.home.viewAllAuctions} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAuctions.length > 0
            ? activeAuctions.map((item) => {
                const img = getMediaUrl(item.product?.images?.[0]?.image_url);
                return (
                  <Card key={item.id} className="group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={img}
                        alt={item.product?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <div className="backdrop-blur-md bg-black/70 text-white rounded-lg px-2.5 py-1 text-xs font-bold flex items-center shadow">
                          <CountdownTimer targetDate={item.end_time} variant="compact" />
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant="neutral" className="bg-black/60 text-white border-none backdrop-blur-md">
                          {item.product?.condition === 'NEW' ? t.common.new : t.common.likeNew}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                          {item.product?.title}
                        </h3>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-slate-500 font-medium">{t.dashboard.currentBid}:</div>
                            <div className="text-xl font-extrabold text-emerald-600">
                              {formatUZS(item.current_highest_bid || item.starting_price)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 font-medium">{t.dashboard.depositAmount}:</div>
                            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {formatUZS(item.deposit_amount)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          <strong className="text-slate-900 dark:text-slate-200">{item.participant_count || 0}</strong> {t.common.participants}
                        </span>
                        <Link to={`/auctions/${item.id}`}>
                          <Button size="sm">{t.auctions.bidBtn}</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })
            : fallbackAuctions.map((item) => (
                <Card key={item.id} className="group flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="warning" className="backdrop-blur-md bg-amber-500/90 text-white border-none flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{item.endsIn}</span>
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="neutral" className="bg-black/60 text-white border-none backdrop-blur-md">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-base line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {item.title}
                      </h3>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-slate-500 font-medium">{t.dashboard.currentBid}:</div>
                          <div className="text-xl font-extrabold text-emerald-600">
                            {formatUZS(item.currentHighestBid)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-medium">{t.dashboard.depositAmount}:</div>
                          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {formatUZS(item.depositAmount)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        <strong className="text-slate-900 dark:text-slate-200">{item.participants}</strong> {t.common.participants}
                      </span>
                      <Link to={`/auctions/${item.id}`}>
                        <Button size="sm">{t.auctions.bidBtn}</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-slate-100/60 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="info" className="mb-3">{t.common.appName}</Badge>
          <h2 className="text-3xl font-extrabold">{t.home.howItWorksTitle}</h2>
          <p className="text-slate-500 text-sm mt-2">
            {t.home.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-white">
                {t.home.step1Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step1Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-white">
                {t.home.step2Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step2Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-white">
                {t.home.step3Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step3Desc}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                4
              </div>
              <h3 className="font-bold text-base mb-1.5 text-slate-900 dark:text-white">
                {t.home.step4Title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.home.step4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  Clock,
  Flame,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';

export const HomePage: React.FC = () => {
  // Sample featured auctions
  const featuredAuctions = [
    {
      id: 'auc-001',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      category: 'Smartfonlar',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 1450000000, // 14 500 000 UZS
      depositAmount: 50000000, // 500 000 UZS
      participants: 12,
      endsIn: '03:42:15',
    },
    {
      id: 'auc-002',
      title: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
      category: 'Geyming',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 620000000, // 6 200 000 UZS
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

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 bg-gradient-to-b from-emerald-50/50 via-transparent to-transparent dark:from-emerald-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O'zbekistondagi 1-raqamli kafolatli auksion maydoni</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            Shaffof raqobat. Haqiqiy narxlar.{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Kafolatlangan xarid.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            AuctionHub orqali mahsulotingizni eng yuqori narxda soting yoki orzuingizdagi buyumni arzonroq narxda yutib oling.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/auctions">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-emerald-500/25">
                <Gavel className="w-5 h-5 mr-2" />
                Auksionlarni ko'rish
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Sotuvchi bo'lish
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Quick stats banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">5 000+</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">Muvaffaqiyatli auksion</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">Qaytariluvchi depozit</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">0.1 sek</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">Jonli takliflar tezligi</div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">24/7</div>
              <div className="text-xs sm:text-sm text-slate-500 mt-1">Eksklyuziv moderatsiya</div>
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
                Qizg'in auksionlar
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Eng ko'p taklif tushayotgan va tez orada yakunlanuvchi savdolar
            </p>
          </div>
          <Link to="/auctions" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
            Hammasini ko'rish <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredAuctions.map((item) => (
            <Card key={item.id} className="group flex flex-col">
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
                      <div className="text-xs text-slate-500 font-medium">Joriy eng yuqori narx:</div>
                      <div className="text-xl font-extrabold text-emerald-600">
                        {formatUZS(item.currentHighestBid)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 font-medium">Depozit:</div>
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {formatUZS(item.depositAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    <strong className="text-slate-900 dark:text-slate-200">{item.participants}</strong> ishtirokchi
                  </span>
                  <Link to={`/auctions/${item.id}`}>
                    <Button size="sm">
                      Taklif berish
                    </Button>
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
          <Badge variant="info" className="mb-3">Oddiy va Ishonchli</Badge>
          <h2 className="text-3xl font-extrabold">Qanday ishlaydi?</h2>
          <p className="text-slate-500 text-sm mt-2">
            AuctionHub tizimida qatnashish 3 ta xavfsiz qadamdan iborat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
              1
            </div>
            <h3 className="font-bold text-lg mb-2">Depozit To'lash</h3>
            <p className="text-sm text-slate-500">
              Qiziqqan auksioningizga qaytariladigan kafolat depozitini to'laysiz.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
              2
            </div>
            <h3 className="font-bold text-lg mb-2">Jonli Taklif Berish</h3>
            <p className="text-sm text-slate-500">
              Boshqa ishtirokchilar bilan real-vaqt rejimida (WebSocket) raqobatlashasiz.
            </p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold text-xl mb-4">
              3
            </div>
            <h3 className="font-bold text-lg mb-2">Yutuq yoki Qaytarish</h3>
            <p className="text-sm text-slate-500">
              Yutsangiz buyumni xarid qilasiz, yutqazgan taqdiringizda depozitingiz darhol to'liq qaytariladi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

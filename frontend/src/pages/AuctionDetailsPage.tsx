import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  UserCheck,
  Truck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { formatUZS } from '../utils/formatters';

export const AuctionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock auction data
  const [isParticipating, setIsParticipating] = useState<boolean>(false);
  const [bidAmount, setBidAmount] = useState<string>('14600000');

  const auction = {
    id: id || 'auc-001',
    title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (Yangi, qadoqda)',
    description: `Asl nusxa, Dubaydan keltirilgan, LL/A versiya. Qutisi ochilmagan, zavod plyonkasida. 1 yil xalqaro Apple kafolati mavjud. IMEI rasmiy ro'yxatdan o'tkazilgan. Toshkent shahri ichida yetkazib berish bepul.`,
    category: 'Elektronika / Smartfonlar',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
    currentHighestBid: 1450000000, // 14 500 000 UZS
    minIncrement: 10000000, // 100 000 UZS
    depositAmount: 50000000, // 500 000 UZS
    startingPrice: 1000000000, // 10 000 000 UZS
    seller: {
      name: 'iStore Official (MChJ)',
      rating: 4.9,
      totalSales: 124,
      isVerified: true,
    },
    endsIn: '03:42:15',
    participantsCount: 12,
    bidHistory: [
      { id: '1', user: 'Anvar K.', amount: 1450000000, time: '12:35' },
      { id: '2', user: 'Sardor M.', amount: 1440000000, time: '12:20' },
      { id: '3', user: 'Jasur B.', amount: 1400000000, time: '11:50' },
    ],
  };

  const nextMinBid = auction.currentHighestBid + auction.minIncrement;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img
              src={auction.imageUrl}
              alt={auction.title}
              className="w-full h-[420px] object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="warning" className="bg-amber-500/90 text-white border-none backdrop-blur-md px-3 py-1 text-sm font-bold flex items-center space-x-1.5">
                <Clock className="w-4 h-4 mr-1" />
                <span>Qolgan vaqt: {auction.endsIn}</span>
              </Badge>
            </div>
          </div>

          {/* Description Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Mahsulot tavsifi</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Yetkazib berish: O'zbekiston bo'ylab</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Kafolat: 1 yil rasmiy</span>
              </div>
            </div>
          </Card>

          {/* Bid History */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center justify-between">
              <span>Takliflar tarixi</span>
              <span className="text-xs font-normal text-slate-500">
                Jami: {auction.bidHistory.length} ta taklif
              </span>
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auction.bidHistory.map((bid, idx) => (
                <div key={bid.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="font-medium">{bid.user}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="font-bold text-emerald-600">
                      {formatUZS(bid.amount)}
                    </span>
                    <span className="text-xs text-slate-400">{bid.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Bidding Action & Seller Info */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 border-2 border-emerald-500/20">
            <div>
              <span className="text-xs text-slate-500 font-medium">{auction.category}</span>
              <h1 className="text-2xl font-extrabold mt-1 leading-snug">
                {auction.title}
              </h1>
            </div>

            {/* Current Price Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Hozirgi eng yuqori taklif</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {formatUZS(auction.currentHighestBid)}
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Minimal qadam: +{formatUZS(auction.minIncrement)}</span>
                <span>Boshlang'ich: {formatUZS(auction.startingPrice)}</span>
              </div>
            </div>

            {/* Deposit / Eligibility Section */}
            {!isParticipating ? (
              <div className="space-y-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    Auksionda taklif berish uchun <strong>{formatUZS(auction.depositAmount)}</strong> kafolat depoziti to'lanishi shart. Yutqazgan taqdiringizda depozit darhol 100% qaytariladi.
                  </div>
                </div>
                <Button
                  onClick={() => setIsParticipating(true)}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  Depozit to'lash ({formatUZS(auction.depositAmount)})
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Siz auksion ishtirokchisisiz. Taklif bera olasiz.</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Sizning taklifingiz (Kamida: {formatUZS(nextMinBid)})
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-lg"
                    />
                    <Button size="md" className="shrink-0">
                      Taklif yuborish
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Seller profile */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Sotuvchi:</div>
                <div className="font-bold text-sm flex items-center space-x-1.5 mt-0.5">
                  <span>{auction.seller.name}</span>
                  {auction.seller.isVerified && (
                    <UserCheck className="w-4 h-4 text-blue-500" />
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Reyting: ★ {auction.seller.rating} ({auction.seller.totalSales} ta savdo)
                </div>
              </div>
              <Button variant="outline" size="sm">
                Bog'lanish
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};


import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  UserCheck,
  Truck,
  AlertCircle,
  CheckCircle2,
  Radio,
  Wifi,
  WifiOff,
  Film,
  Play,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import {
  auctionsService,
  biddingService,
  participantsService,
  getMediaUrl,
  isVideoMedia,
} from '../services/api';
import { Auction, Bid, ParticipationStatus } from '../types';
import { useAuctionWebSocket, BidEventData, AuctionCompletedEventData } from '../hooks/useAuctionWebSocket';

export const AuctionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();

  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [participation, setParticipation] = useState<ParticipationStatus | null>(null);
  const [bidAmountUzs, setBidAmountUzs] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingBid, setIsSubmittingBid] = useState<boolean>(false);
  const [isPayingDeposit, setIsPayingDeposit] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);

  // Fallback demo auction data if requested auction not yet in DB
  const fallbackAuction: Auction = {
    id: id || 'demo-001',
    seller_id: 'seller-demo',
    product_id: 'prod-demo',
    starting_price: 1000000000, // 10 000 000 UZS
    reserve_price: 1500000000, // 15 000 000 UZS
    min_bid_increment: 10000000, // 100 000 UZS
    deposit_amount: 50000000, // 500 000 UZS
    current_highest_bid: 1450000000, // 14 500 000 UZS
    bid_count: 3,
    participant_count: 12,
    start_time: new Date(Date.now() - 3600000).toISOString(),
    end_time: new Date(Date.now() + 14400000).toISOString(),
    status: 'ACTIVE',
    delivery_info: "O'zbekiston bo'ylab 1-3 kun ichida yetkazib beriladi.",
    rules: "G'olib 48 soat ichida qolgan summani to'lashi shart.",
    product: {
      id: 'prod-demo',
      seller_id: 'seller-demo',
      category_id: 'cat-demo',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (Yangi, qadoqda)',
      description: `Asl nusxa, Dubaydan keltirilgan, LL/A versiya. Qutisi ochilmagan, zavod plyonkasida. 1 yil xalqaro Apple kafolati mavjud. IMEI rasmiy ro'yxatdan o'tkazilgan. Toshkent shahri ichida yetkazib berish bepul.`,
      condition: 'NEW',
      is_approved: true,
      created_at: new Date().toISOString(),
      images: [
        {
          id: 'img-1',
          image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
          is_primary: true,
          display_order: 1,
        },
      ],
    },
  };

  // Fetch auction details & bids
  const loadAuctionData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await auctionsService.getById(id);
      setAuction(data);
      const minNext = (data.current_highest_bid + data.min_bid_increment) / 100;
      setBidAmountUzs(minNext.toString());

      try {
        const bidsData = await biddingService.listBids(id);
        setBids(bidsData);
      } catch {
        // fallback empty bids
      }

      if (isAuthenticated) {
        try {
          const partData = await participantsService.getParticipationStatus(id);
          setParticipation(partData);
        } catch {
          // ignore
        }
      }
    } catch {
      // Use fallback demo auction
      setAuction(fallbackAuction);
      const minNext = (fallbackAuction.current_highest_bid + fallbackAuction.min_bid_increment) / 100;
      setBidAmountUzs(minNext.toString());
      setBids([
        {
          id: '1',
          auction_id: fallbackAuction.id,
          user_id: 'u-1',
          amount: 1450000000,
          amount_uzs: 14500000,
          created_at: new Date(Date.now() - 1200000).toISOString(),
          bidder_name: 'Anvar K.',
        },
        {
          id: '2',
          auction_id: fallbackAuction.id,
          user_id: 'u-2',
          amount: 1440000000,
          amount_uzs: 14400000,
          created_at: new Date(Date.now() - 2400000).toISOString(),
          bidder_name: 'Sardor M.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    loadAuctionData();
  }, [loadAuctionData]);

  // Handle incoming live WebSocket events
  const handleWebSocketBid = useCallback((data: BidEventData) => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        current_highest_bid: data.new_highest_bid,
        bid_count: prev.bid_count + 1,
        end_time: data.end_time || prev.end_time,
      };
    });

    const newBid: Bid = {
      id: data.bid_id,
      auction_id: data.auction_id,
      user_id: 'live-user',
      amount: data.amount,
      amount_uzs: data.amount / 100,
      created_at: data.created_at,
      bidder_name: data.bidder_name || 'Yangi taklif',
    };

    setBids((prev) => [newBid, ...prev.filter((b) => b.id !== newBid.id)]);
  }, []);

  const handleWebSocketCompleted = useCallback((data: AuctionCompletedEventData) => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: data.status as any,
        current_highest_bid: data.highest_bid,
      };
    });
  }, []);

  const { isConnected } = useAuctionWebSocket({
    auctionId: id,
    onBidCreated: handleWebSocketBid,
    onAuctionCompleted: handleWebSocketCompleted,
  });

  // Participate (Pay deposit)
  const handleParticipate = async () => {
    if (!isAuthenticated) {
      setFeedback({ type: 'error', message: 'Iltimos, auksionda qatnashish uchun avval tizimga kiring.' });
      return;
    }
    if (!auction) return;

    setIsPayingDeposit(true);
    setFeedback(null);
    try {
      await participantsService.participate(auction.id);
      setParticipation({
        is_eligible: true,
        is_seller: false,
        deposit_status: 'PAID',
        participant_status: 'ACTIVE',
        deposit_amount: auction.deposit_amount,
      });
      setFeedback({ type: 'success', message: 'Kafolat depoziti muvaffaqiyatli to\'landi! Endi taklif bera olasiz.' });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Depozit to\'lashda xatolik yuz berdi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsPayingDeposit(false);
    }
  };

  // Submit Bid
  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;
    setFeedback(null);

    const val = parseInt(bidAmountUzs, 10);
    const minRequiredUzs = (auction.current_highest_bid + auction.min_bid_increment) / 100;
    if (isNaN(val) || val < minRequiredUzs) {
      setFeedback({
        type: 'error',
        message: `Minimal taklif summasi ${formatUZS(minRequiredUzs * 100)} bo'lishi shart.`,
      });
      return;
    }

    setIsSubmittingBid(true);
    try {
      const newBid = await biddingService.submitBid(auction.id, val);
      setBids((prev) => [newBid, ...prev]);
      setAuction((prev) =>
        prev
          ? {
              ...prev,
              current_highest_bid: newBid.amount,
              bid_count: prev.bid_count + 1,
            }
          : null
      );
      const nextMin = (newBid.amount + auction.min_bid_increment) / 100;
      setBidAmountUzs(nextMin.toString());
      setFeedback({ type: 'success', message: 'Sizning taklifingiz muvaffaqiyatli qabul qilindi!' });
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Taklif yuborishda xatolik yuz berdi.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmittingBid(false);
    }
  };

  const current = auction || fallbackAuction;
  const nextMinBid = current.current_highest_bid + current.min_bid_increment;
  const isEligible = participation?.is_eligible || false;
  const isOwner = user?.id === current.seller_id;

  if (isLoading && !auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-slate-500">Auksion ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 pb-2">
        <Link to="/" className="hover:text-emerald-600 transition-colors">
          Bosh sahifa
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/auctions" className="hover:text-emerald-600 transition-colors">
          Auksionlar bozori
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
          {current.product?.title || 'Lot tafsilotlari'}
        </span>
      </div>

      {/* Live Connection Banner */}
      <div className="mb-4 flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium flex items-center">
                <Radio className="w-3 h-3 mr-1 animate-pulse" /> Jonli ulanish faol (Real-time WebSocket)
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-500" />
              <span>Standart ulanish (Avtomatik yangilanadi)</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Auksion ID: {current.id.slice(0, 8)}...</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`mb-6 p-4 rounded-2xl flex items-center space-x-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media (Images & Videos) & Details */}
        <div className="lg:col-span-7 space-y-6">
          {(() => {
            const productImages = current.product?.images || [];
            const activeMedia = productImages[activeMediaIndex] || productImages[0];
            const activeUrl = activeMedia
              ? getMediaUrl(activeMedia.image_url)
              : 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80';
            const isVideo = activeMedia ? isVideoMedia(activeMedia.image_url) : false;

            return (
              <div className="space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                  {isVideo ? (
                    <video
                      key={activeUrl}
                      src={activeUrl}
                      controls
                      autoPlay={false}
                      className="w-full h-[420px] object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={activeUrl}
                      alt={current.product?.title || 'Mahsulot rasmi'}
                      className="w-full h-[420px] object-cover"
                    />
                  )}

                  <div className="absolute top-4 left-4 z-10">
                    <Badge
                      variant="warning"
                      className="bg-amber-500/90 text-white border-none backdrop-blur-md px-3 py-1 text-sm font-bold flex items-center space-x-1.5 shadow"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {current.status === 'ACTIVE'
                          ? `Tugash vaqti: ${new Date(current.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : current.status}
                      </span>
                    </Badge>
                  </div>

                  {isVideo && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-indigo-600/90 text-white border-none backdrop-blur-md px-2.5 py-1 text-xs font-semibold flex items-center shadow">
                        <Film className="w-3.5 h-3.5 mr-1" />
                        Video ko'rinish
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery Row */}
                {productImages.length > 1 && (
                  <div className="flex items-center space-x-3 overflow-x-auto pb-2 pt-1">
                    {productImages.map((img, idx) => {
                      const thumbUrl = getMediaUrl(img.image_url);
                      const isThumbVideo = isVideoMedia(img.image_url);
                      const isSelected = idx === activeMediaIndex;
                      return (
                        <button
                          key={img.id || idx}
                          type="button"
                          onClick={() => setActiveMediaIndex(idx)}
                          className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-105'
                              : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                          }`}
                        >
                          {isThumbVideo ? (
                            <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                              <video src={thumbUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Play className="w-4 h-4 text-white fill-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={thumbUrl}
                              alt={`thumb-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Description Card */}
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Mahsulot tavsifi</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {current.product?.description || current.delivery_info}
            </p>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Yetkazib berish: {current.delivery_info || "O'zbekiston bo'ylab"}</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Qoidalar: {current.rules || "Platforma standart kafolati"}</span>
              </div>
            </div>
          </Card>

          {/* Bid History */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center justify-between">
              <span>Takliflar tarixi</span>
              <span className="text-xs font-normal text-slate-500">
                Jami: {bids.length} ta taklif
              </span>
            </h3>

            {bids.length === 0 ? (
              <div className="text-center py-6 text-sm text-slate-400">
                Hozircha narx takliflari berilmagan. Birinchi bo'lib taklif bering!
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {bids.map((bid, idx) => (
                  <div key={bid.id} className="py-3 flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-medium">
                        {bid.bidder_name || `Ishtirokchi #${bid.user_id?.slice(0, 5)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-emerald-600">
                        {formatUZS(bid.amount)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Bidding Action & Seller Info */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6 border-2 border-emerald-500/20">
            <div>
              <span className="text-xs text-slate-500 font-medium">Lot #{current.id.slice(0, 8)}</span>
              <h1 className="text-2xl font-extrabold mt-1 leading-snug">
                {current.product?.title || 'Auksion mahsuloti'}
              </h1>
            </div>

            {/* Current Price Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="text-xs text-slate-500">Hozirgi eng yuqori taklif</div>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {formatUZS(current.current_highest_bid)}
              </div>
              <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Minimal qadam: +{formatUZS(current.min_bid_increment)}</span>
                <span>Boshlang'ich: {formatUZS(current.starting_price)}</span>
              </div>
            </div>

            {/* Eligibility & Bid Section */}
            {isOwner ? (
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Bu sizning shaxsiy auksioningiz. Sotuvchi o'z auksionida taklif bera olmaydi.</span>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    Auksionda ishtirok etish va narx taklifini yuborish uchun tizimga kiring.
                  </div>
                </div>
                <Link to="/login">
                  <Button className="w-full">Tizimga kirish</Button>
                </Link>
              </div>
            ) : !isEligible ? (
              <div className="space-y-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200">
                    Auksionda taklif berish uchun <strong>{formatUZS(current.deposit_amount)}</strong> kafolat depoziti to'lanishi shart. Yutqazgan taqdiringizda depozit darhol 100% qaytariladi.
                  </div>
                </div>
                <Button
                  onClick={handleParticipate}
                  isLoading={isPayingDeposit}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Depozit to'lash ({formatUZS(current.deposit_amount)})
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitBid} className="space-y-4">
                <div className="flex items-center space-x-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Siz kafolat depozitini to'lagansiz. Taklif bera olasiz!</span>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Sizning taklifingiz (Kamida: {formatUZS(nextMinBid)})
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={bidAmountUzs}
                      onChange={(e) => setBidAmountUzs(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-lg"
                      placeholder={((nextMinBid) / 100).toString()}
                    />
                    <Button type="submit" isLoading={isSubmittingBid} size="md" className="shrink-0">
                      Taklif yuborish
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Seller profile */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Sotuvchi:</div>
                <div className="font-bold text-sm flex items-center space-x-1.5 mt-0.5">
                  <span>{current.product?.seller_id ? 'Ishonchli sotuvchi' : 'iStore Official (MChJ)'}</span>
                  <UserCheck className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Reyting: ★ 4.9 (124 ta muvaffaqiyatli savdo)
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

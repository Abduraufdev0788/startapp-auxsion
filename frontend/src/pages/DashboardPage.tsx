import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Gavel,
  CreditCard,
  RotateCcw,
  PlusCircle,
  Bell,
  AlertCircle,
  X,
  Package,
  Trophy,
  User,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
  Trash2,
  FolderPlus,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import {
  depositsService,
  notificationsService,
  categoriesService,
  productsService,
  auctionsService,
  getMediaUrl,
} from '../services/api';
import { Deposit, Notification, Category, Auction } from '../types';

type DashboardTab = 'auctions' | 'deposits' | 'notifications' | 'profile';
type AuctionSubFilter = 'all' | 'participating' | 'created' | 'won';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Kirishi bilanoq auksionlarda turishi kerak
  const [activeTab, setActiveTab] = useState<DashboardTab>('auctions');
  const [auctionSubFilter, setAuctionSubFilter] = useState<AuctionSubFilter>('all');

  const [createdAuctions, setCreatedAuctions] = useState<Auction[]>([]);
  const [participatingAuctions, setParticipatingAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Create Auction Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // Media files (photos & videos)
  const [mediaItems, setMediaItems] = useState<
    { file: File; previewUrl: string; isVideo: boolean }[]
  >([]);

  // Category management inside modal
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [isCreatingCat, setIsCreatingCat] = useState<boolean>(false);

  // New Auction Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [startingPriceUzs, setStartingPriceUzs] = useState('1000000');
  const [reservePriceUzs, setReservePriceUzs] = useState('1500000');
  const [minIncrementUzs, setMinIncrementUzs] = useState('50000');
  const [depositAmountUzs, setDepositAmountUzs] = useState('100000');
  const [durationDays, setDurationDays] = useState('3');
  const [deliveryInfo, setDeliveryInfo] = useState("O'zbekiston bo'ylab yetkazib beriladi.");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadUserData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [
        createdList,
        participatingList,
        wonList,
        depList,
        notifList,
        catList,
      ] = await Promise.all([
        auctionsService.getMyCreated().catch(() => []),
        auctionsService.getMyParticipating().catch(() => []),
        auctionsService.getMyWon().catch(() => []),
        depositsService.getMyDeposits().catch(() => []),
        notificationsService.list().catch(() => []),
        categoriesService.list().catch(() => []),
      ]);

      setCreatedAuctions(createdList);
      setParticipatingAuctions(participatingList);
      setWonAuctions(wonList);
      setDeposits(depList);
      setNotifications(notifList);
      setCategories(catList);
      if (catList.length > 0 && !categoryId) {
        setCategoryId(catList[0].id);
      }
    } finally {
      setIsLoadingData(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated, loadUserData]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // ignore
    }
  };

  const handleMediaFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        isVideo:
          file.type.startsWith('video/') ||
          /\.(mp4|webm|mov|ogg|avi|mkv)$/i.test(file.name),
      }));
      setMediaItems((prev) => [...prev, ...newItems]);
    }
  };

  const handleRemoveMediaItem = (idx: number) => {
    setMediaItems((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleQuickAddCategory = async () => {
    if (!newCatName.trim()) return;
    setIsCreatingCat(true);
    setModalFeedback(null);
    try {
      const created = await categoriesService.create({
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
        icon: 'Package',
      });
      setCategories((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      setCategoryId(created.id);
      setNewCatName('');
      setNewCatDesc('');
      setShowNewCatInput(false);
    } catch (err: any) {
      const raw = err.response?.data?.detail;
      const msg =
        typeof raw === 'string'
          ? raw
          : Array.isArray(raw)
          ? raw.map((d: any) => d.msg).join(', ')
          : "Toifa qo'shishda xatolik yuz berdi.";
      setModalFeedback(msg);
    } finally {
      setIsCreatingCat(false);
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);

    // Validation
    if (!title.trim() || title.trim().length < 3) {
      setModalFeedback("Mahsulot nomi kamida 3 ta belgidan iborat bo'lishi shart.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setModalFeedback("Mahsulot tavsifi kamida 10 ta belgidan iborat bo'lishi shart.");
      return;
    }

    const catIdToUse = categoryId || categories[0]?.id;
    if (!catIdToUse) {
      setModalFeedback("Iltimos, mahsulot toifasini tanlang yoki yangi toifa qo'shing.");
      return;
    }

    const startPrice = parseInt(startingPriceUzs, 10);
    const resPrice = parseInt(reservePriceUzs, 10);
    const minInc = parseInt(minIncrementUzs, 10);
    const depAmt = parseInt(depositAmountUzs, 10);

    if (isNaN(startPrice) || startPrice <= 0) {
      setModalFeedback("Boshlang'ich narx 0 dan katta bo'lishi shart.");
      return;
    }
    if (isNaN(resPrice) || resPrice < startPrice) {
      setModalFeedback("Minimal sotish narxi boshlang'ich narxdan kam bo'lmasligi shart.");
      return;
    }
    if (isNaN(minInc) || minInc <= 0) {
      setModalFeedback("Minimal qadam 0 dan katta bo'lishi shart.");
      return;
    }
    if (isNaN(depAmt) || depAmt <= 0) {
      setModalFeedback("Kafolat depoziti summasi 0 dan katta bo'lishi shart.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStep("Mahsulot ma'lumotlari saqlanmoqda...");

    try {
      // 1. Create Product
      const product = await productsService.create({
        title: title.trim(),
        description: description.trim(),
        category_id: catIdToUse,
        condition: 'NEW',
      });

      // 2. Upload Photos and Videos if selected
      if (mediaItems.length > 0) {
        setSubmitStep(`Rasmlar va videolar yuklanmoqda (${mediaItems.length} ta)...`);
        const filesToUpload = mediaItems.map((m) => m.file);
        await productsService.uploadMedia(product.id, filesToUpload);
      }

      // 3. Create Auction
      setSubmitStep("Auksion yaratilmoqda...");
      const startTime = new Date();
      const endTime = new Date(Date.now() + parseInt(durationDays, 10) * 86400000);

      const auction = await auctionsService.create({
        product_id: product.id,
        starting_price_uzs: startPrice,
        reserve_price_uzs: resPrice,
        min_bid_increment_uzs: minInc,
        deposit_amount_uzs: depAmt,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        delivery_info: deliveryInfo,
        rules: "G'olib 48 soat ichida qolgan summani to'lashi shart.",
      });

      // 4. Publish Auction
      setSubmitStep("Auksion faollashtirilmoqda...");
      await auctionsService.publish(auction.id);

      // Cleanup previews
      mediaItems.forEach((m) => URL.revokeObjectURL(m.previewUrl));
      setMediaItems([]);
      setIsModalOpen(false);
      navigate(`/auctions/${auction.id}`);
    } catch (err: any) {
      const raw = err.response?.data?.detail;
      let msg = "Auksion yaratishda xatolik yuz berdi.";
      if (typeof raw === 'string') {
        msg = raw;
      } else if (Array.isArray(raw)) {
        msg = raw.map((d: any) => `${d.loc?.slice(-1)[0] || 'Maydon'}: ${d.msg}`).join(', ');
      }
      setModalFeedback(msg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  // Calculations
  const lockedDeposits = deposits
    .filter((d) => d.status === 'LOCKED' || d.status === 'PAID')
    .reduce((sum, d) => sum + d.amount, 0);

  const refundedDeposits = deposits
    .filter((d) => d.status === 'REFUNDED')
    .reduce((sum, d) => sum + d.amount, 0);

  // Aggregate auctions for "all"
  const allUserAuctionsMap = new Map<string, Auction>();
  participatingAuctions.forEach((a) => allUserAuctionsMap.set(a.id, a));
  createdAuctions.forEach((a) => allUserAuctionsMap.set(a.id, a));
  wonAuctions.forEach((a) => allUserAuctionsMap.set(a.id, a));
  const allUserAuctions = Array.from(allUserAuctionsMap.values());

  const displayedAuctions =
    auctionSubFilter === 'participating'
      ? participatingAuctions
      : auctionSubFilter === 'created'
      ? createdAuctions
      : auctionSubFilter === 'won'
      ? wonAuctions
      : allUserAuctions;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold">
            {user?.full_name?.slice(0, 2).toUpperCase() || 'AH'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.full_name || 'Foydalanuvchi'}</h1>
            <p className="text-emerald-100 text-xs mt-0.5 flex items-center space-x-2">
              <span>{user?.phone}</span>
              <span>•</span>
              <span className="flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-200" />
                {user?.is_verified ? 'Tasdiqlangan hisob' : 'Standart hisob'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="secondary"
            size="md"
            className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50 font-bold"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Yangi auksion yaratish
          </Button>
        </div>
      </div>

      {/* Overview Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ishtiroklarim</span>
            <Gavel className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold">{participatingAuctions.length} ta</div>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Sotuvdagi lotlarim</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold">{createdAuctions.length} ta</div>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Yutuqlarim</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold">{wonAuctions.length} ta</div>
        </Card>

        <Card className="p-4 space-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Band qilingan depozit</span>
            <CreditCard className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-extrabold">{formatUZS(lockedDeposits)}</div>
        </Card>
      </div>

      {/* Main Tabs (Bo'limlar) - Kirishi bilan auksionlarda turadi */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('auctions')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'auctions'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Auksionlarim ({allUserAuctions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'deposits'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Depozitlar va Qaytarmalar ({deposits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Bildirishnomalar ({notifications.filter((n) => !n.is_read).length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil ma'lumotlari</span>
        </button>
      </div>

      {/* Content */}
      {isLoadingData ? (
        <div className="py-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-500">Ma'lumotlar yuklanmoqda...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: AUCTIONS (Kirishi bilanoq auksionlarda turadi) */}
          {activeTab === 'auctions' && (
            <div className="space-y-6">
              {/* Sub-filters for Auctions */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setAuctionSubFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    auctionSubFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Barchasi ({allUserAuctions.length})
                </button>

                <button
                  onClick={() => setAuctionSubFilter('participating')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    auctionSubFilter === 'participating'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Ishtirok etayotganlarim ({participatingAuctions.length})
                </button>

                <button
                  onClick={() => setAuctionSubFilter('created')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    auctionSubFilter === 'created'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Sotuvga qo'yganlarim ({createdAuctions.length})
                </button>

                <button
                  onClick={() => setAuctionSubFilter('won')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    auctionSubFilter === 'won'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  Yutib olinganlar ({wonAuctions.length})
                </button>
              </div>

              {/* Auctions Grid */}
              {displayedAuctions.length === 0 ? (
                <Card className="p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
                    <Gavel className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base">Hozircha hech qanday auksion yo'q</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {auctionSubFilter === 'participating'
                        ? "Siz hali kafolat depoziti to'lab hech bir auksionda ishtirok etmadingiz."
                        : auctionSubFilter === 'created'
                        ? "Siz hali o'z mahsulotingizni auksionga qo'ymadingiz."
                        : auctionSubFilter === 'won'
                        ? "Siz hali yakunlangan auksionlarda g'olib bo'lmadingiz."
                        : "Sizda hozircha auksionlar mavjud emas."}
                    </p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <Link to="/auctions">
                      <Button size="sm">Bozordagi auksionlarni ko'rish</Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(true)}
                    >
                      Yangi auksion e'lon qilish
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedAuctions.map((auc) => (
                    <Card
                      key={auc.id}
                      className="overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                          <img
                            src={getMediaUrl(auc.product?.images?.[0]?.image_url)}
                            alt={auc.product?.title || 'Auksion'}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge
                              variant={
                                auc.status === 'ACTIVE'
                                  ? 'warning'
                                  : auc.status === 'COMPLETED'
                                  ? 'success'
                                  : 'neutral'
                              }
                            >
                              {auc.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-sm line-clamp-1">
                            {auc.product?.title || 'Lot #' + auc.id.slice(0, 8)}
                          </h4>
                          <div className="text-xs text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              Tugash: {new Date(auc.end_time).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="text-[11px] text-slate-400">
                              Hozirgi taklif:
                            </div>
                            <div className="text-lg font-extrabold text-emerald-600">
                              {formatUZS(auc.current_highest_bid)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <Link to={`/auctions/${auc.id}`}>
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            Batafsil ko'rish
                            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEPOSITS & REFUNDS */}
          {activeTab === 'deposits' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-5 space-y-1">
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Muzlatilgan depozitlar (LOCKED)</span>
                    <CreditCard className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-600">
                    {formatUZS(lockedDeposits)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auksion davomida ishtirokingizni kafolatlaydi
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <span>Qaytarilgan depozitlar (REFUNDED)</span>
                    <RotateCcw className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-600">
                    +{formatUZS(refundedDeposits)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Auksion tugashi bilan 100% kartangizga qaytarilgan
                  </p>
                </Card>
              </div>

              <Card className="p-6">
                <h3 className="font-bold text-base mb-4">Depozitlar va Qaytarmalar jurnali</h3>
                {deposits.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    Siz hali hech qaysi auksion uchun kafolat depoziti to'lamagansiz.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {deposits.map((d) => (
                      <div
                        key={d.id}
                        className="py-3 flex items-center justify-between text-sm"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                            <span>Kafolat depoziti</span>
                            <span className="text-xs text-slate-400 font-normal">
                              (Auksion #{d.auction_id.slice(0, 8)})
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(d.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {formatUZS(d.amount)}
                          </div>
                          <Badge
                            variant={
                              d.status === 'REFUNDED'
                                ? 'success'
                                : d.status === 'LOCKED' || d.status === 'PAID'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {d.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* TAB 3: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base">Bildirishnomalar</h3>
                {notifications.some((n) => !n.is_read) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Barchasini o'qildi deb belgilash
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Bildirishnomalar mavjud emas.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="py-4 flex items-start justify-between text-sm"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{n.title}</span>
                          {!n.is_read && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {n.body}
                        </p>
                        <span className="text-[11px] text-slate-400">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                      {!n.is_read && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="shrink-0 ml-4 text-xs"
                        >
                          O'qildi
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <Card className="p-6 space-y-6">
              <h3 className="font-bold text-lg">Profil ma'lumotlari va Xavfsizlik</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">To'liq ism</div>
                  <div className="font-semibold text-base">{user?.full_name}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Telefon raqami</div>
                  <div className="font-semibold text-base">{user?.phone}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Elektron pochta</div>
                  <div className="font-semibold text-base">
                    {user?.email || 'Kiritilmagan'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Rollar</div>
                  <div className="flex gap-1.5 pt-1">
                    {user?.roles?.map((r) => (
                      <Badge key={r} variant="neutral">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Hisob holati</div>
                  <div className="pt-1">
                    <Badge variant={user?.is_active ? 'success' : 'danger'}>
                      {user?.is_active ? 'FAOL' : 'BLOKLANGAN'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">Identifikatsiya</div>
                  <div className="pt-1">
                    <Badge variant={user?.is_verified ? 'success' : 'warning'}>
                      {user?.is_verified ? 'TASDIQLANGAN' : 'TASDIQLANMAGAN'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Create Auction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <Package className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold">Yangi auksion e'lon qilish</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalFeedback && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalFeedback}</span>
              </div>
            )}

            <form onSubmit={handleCreateAuction} className="space-y-5 text-xs">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mahsulot nomi *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: Apple MacBook Pro 16 M3 Max"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Product Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mahsulot tavsifi *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mahsulotning to'liq holati, parametrlari, kafolati va to'plami haqida batafsil yozing..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Media Uploads (Images & Videos) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Rasmlar va videolar</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({mediaItems.length} ta tanlandi)
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    JPG, PNG, WebP, MP4, WebM (ko'pi bilan 50MB)
                  </span>
                </div>

                {/* Upload Trigger / Dropzone */}
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/60 dark:bg-slate-800/40">
                  <UploadCloud className="w-8 h-8 text-emerald-500 mb-1.5" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    Fayllarni tanlash uchun bosing yoki bu yerga sudrab tashlang
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    Mahsulotning aniq fotosuratlari va qisqa video ko'rinishini qo'shishingiz mumkin
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaFilesSelect}
                    className="hidden"
                  />
                </label>

                {/* Selected Previews Grid */}
                {mediaItems.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {mediaItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center"
                      >
                        {item.isVideo ? (
                          <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                            <video
                              src={item.previewUrl}
                              className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow">
                                <VideoIcon className="w-4 h-4" />
                              </div>
                            </div>
                            <span className="absolute bottom-1 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded font-medium">
                              Video
                            </span>
                          </div>
                        ) : (
                          <div className="relative w-full h-full">
                            <img
                              src={item.previewUrl}
                              alt={`preview-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <span className="absolute bottom-1 left-1.5 text-[9px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-medium">
                                Asosiy
                              </span>
                            )}
                          </div>
                        )}

                        {/* Remove file button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveMediaItem(idx)}
                          className="absolute top-1 right-1 p-1 rounded-lg bg-red-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                          title="Faylni o'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Toifa *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput((prev) => !prev)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center hover:underline"
                    >
                      <FolderPlus className="w-3.5 h-3.5 mr-1" />
                      {showNewCatInput ? "Bekor qilish" : "+ Yangi toifa"}
                    </button>
                  </div>

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {categories.length === 0 && (
                      <option value="">Toifalar yuklanmoqda...</option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Inline New Category Creation Box */}
                  {showNewCatInput && (
                    <div className="p-3 mt-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">
                        Yangi toifa qo'shish
                      </div>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="Toifa nomi (masalan: Sport buyumlari)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder="Tavsifi (ixtiyoriy)"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
                      />
                      <div className="flex justify-end pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleQuickAddCategory}
                          isLoading={isCreatingCat}
                          className="text-xs py-1"
                        >
                          Toifani saqlash va tanlash
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Davomiyligi (kun) *
                  </label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="1">1 kun (24 soat)</option>
                    <option value="3">3 kun</option>
                    <option value="5">5 kun</option>
                    <option value="7">7 kun (1 hafta)</option>
                    <option value="14">14 kun (2 hafta)</option>
                  </select>
                </div>
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Boshlang'ich narx (so'm) *
                  </label>
                  <input
                    type="number"
                    value={startingPriceUzs}
                    onChange={(e) => setStartingPriceUzs(e.target.value)}
                    required
                    min={1}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Minimal sotish narxi (so'm) *
                  </label>
                  <input
                    type="number"
                    value={reservePriceUzs}
                    onChange={(e) => setReservePriceUzs(e.target.value)}
                    required
                    min={1}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Lot ushbu narxdan pastga sotilmaydi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Minimal qadam (so'm) *
                  </label>
                  <input
                    type="number"
                    value={minIncrementUzs}
                    onChange={(e) => setMinIncrementUzs(e.target.value)}
                    required
                    min={1}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Kafolat depoziti (so'm) *
                  </label>
                  <input
                    type="number"
                    value={depositAmountUzs}
                    onChange={(e) => setDepositAmountUzs(e.target.value)}
                    required
                    min={1}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">
                    Ishtirokchilar to'laydigan qaytariladigan kafolat
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Yetkazib berish ma'lumotlari
                </label>
                <input
                  type="text"
                  value={deliveryInfo}
                  onChange={(e) => setDeliveryInfo(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  {submitStep && (
                    <span className="flex items-center text-emerald-600 animate-pulse">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {submitStep}
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Bekor qilish
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {submitStep || "Auksionni e'lon qilish"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

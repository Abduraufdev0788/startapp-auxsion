import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Gavel,
  CreditCard,
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
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
  Trash2,
  FolderPlus,
  Radio,
  Search,
  Settings,
  KeyRound,
  MapPin,
  Layers,
  Shield,
  Eye,
  Tag,
  Heart,
  Users,
  Sun,
  Moon,
  Globe,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { WithdrawalModal } from '../components/common/WithdrawalModal';
import {
  depositsService,
  paymentsService,
  notificationsService,
  categoriesService,
  productsService,
  auctionsService,
  usersService,
  favoritesService,
  getMediaUrl,
  isVideoMedia,
} from '../services/api';
import {
  Deposit,
  Notification,
  Category,
  Auction,
  WalletBalance,
  Withdrawal,
  WalletTransaction,
} from '../types';

type DashboardSection =
  | 'market'
  | 'participating'
  | 'created'
  | 'won'
  | 'favorites'
  | 'all_auctions'
  | 'deposits'
  | 'notifications'
  | 'settings';

type ProductCondition = 'NEW' | 'LIKE_NEW' | 'USED';

const UZBEKISTAN_REGIONS = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Farg\'ona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Buxoro viloyati',
  'Xorazm viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Navoiy viloyati',
  'Qoraqalpog\'iston Respublikasi',
];

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Section from URL or default to "market"
  const tabParam = searchParams.get('section') as DashboardSection | null;
  const [activeSection, setActiveSection] = useState<DashboardSection>(tabParam || 'market');

  // Auctions Data
  const [marketAuctions, setMarketAuctions] = useState<Auction[]>([]);
  const [createdAuctions, setCreatedAuctions] = useState<Auction[]>([]);
  const [participatingAuctions, setParticipatingAuctions] = useState<Auction[]>([]);
  const [wonAuctions, setWonAuctions] = useState<Auction[]>([]);
  const [favoriteAuctions, setFavoriteAuctions] = useState<Auction[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Wallet & Financial State
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState<boolean>(false);
  const [financeSubTab, setFinanceSubTab] = useState<'transactions' | 'withdrawals' | 'deposits'>('transactions');

  // In-Dashboard Single Search & Filters
  const initialSearchParam = searchParams.get('search') || '';
  const initialCatParam = searchParams.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParam);
  const [filterCategory, setFilterCategory] = useState<string>(initialCatParam);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    const s = searchParams.get('search');
    const c = searchParams.get('category');
    if (s !== null) setSearchQuery(s);
    if (c !== null) setFilterCategory(c);
  }, [searchParams]);

  // OLX-Style Selling Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // OLX Listing Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState<ProductCondition>('NEW');
  const [startingPriceUzs, setStartingPriceUzs] = useState('1000000');
  const [reservePriceUzs, setReservePriceUzs] = useState('1500000');
  const [minIncrementUzs, setMinIncrementUzs] = useState('50000');
  const [depositAmountUzs, setDepositAmountUzs] = useState('100000');
  const [region, setRegion] = useState('Toshkent shahri');
  const [deliveryInfo, setDeliveryInfo] = useState("O'zbekiston bo'ylab pochta va kuryer orqali yetkaziladi");
  const [durationDays, setDurationDays] = useState('3');

  // Media files (Photos & Videos)
  const [mediaItems, setMediaItems] = useState<
    { file: File; previewUrl: string; isVideo: boolean }[]
  >([]);

  // Inline Category Creator inside modal
  const [showNewCatInput, setShowNewCatInput] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [newCatDesc, setNewCatDesc] = useState<string>('');
  const [isCreatingCat, setIsCreatingCat] = useState<boolean>(false);

  // Settings State
  const [settingsFullName, setSettingsFullName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsCity, setSettingsCity] = useState('Toshkent shahri');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsBio, setSettingsBio] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Notification Toggles State
  const [notifBids, setNotifBids] = useState(true);
  const [notifWins, setNotifWins] = useState(true);
  const [notifDeposits, setNotifDeposits] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Sync active section to URL
  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  // Open modal if URL parameter is present
  useEffect(() => {
    if (searchParams.get('openModal') === 'true') {
      setIsModalOpen(true);
    }
  }, [searchParams]);

  // Handle Heart Favorite Toggle
  const handleToggleFavorite = async (e: React.MouseEvent, auctionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await favoritesService.toggle(auctionId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.is_favorite) {
          next.add(auctionId);
        } else {
          next.delete(auctionId);
        }
        return next;
      });
      // Refresh favorites list if currently in favorites tab
      favoritesService.list().then(setFavoriteAuctions).catch(() => {});
    } catch (err) {
      console.error("Sevimlilarga qo'shishda xatolik:", err);
    }
  };

  // Load User and Marketplace Data
  const loadUserData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [
        createdList,
        participatingList,
        wonList,
        marketRes,
        favList,
        favIds,
        depList,
        notifList,
        catList,
        walletRes,
        withdrawalList,
        txList,
      ] = await Promise.all([
        auctionsService.getMyCreated().catch(() => []),
        auctionsService.getMyParticipating().catch(() => []),
        auctionsService.getMyWon().catch(() => []),
        auctionsService.list({ status: 'ACTIVE' }).catch(() => ({ items: [] })),
        favoritesService.list().catch(() => []),
        favoritesService.getIds().catch(() => []),
        depositsService.getMyDeposits().catch(() => []),
        notificationsService.list().catch(() => []),
        categoriesService.list().catch(() => []),
        paymentsService.getWalletBalance().catch(() => null),
        paymentsService.getWithdrawals().catch(() => []),
        paymentsService.getWalletTransactions().catch(() => []),
      ]);

      setCreatedAuctions(createdList);
      setParticipatingAuctions(participatingList);
      setWonAuctions(wonList);
      setMarketAuctions(marketRes.items || []);
      setFavoriteAuctions(favList || []);
      setFavoriteIds(new Set(favIds || []));
      setDeposits(depList);
      setNotifications(notifList);
      setCategories(catList);
      if (walletRes) {
        setWalletBalance(walletRes);
      }
      setWithdrawals(withdrawalList);
      setWalletTransactions(txList);
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
      // Load user profile details for Settings
      usersService
        .getMyProfile()
        .then((data: any) => {
          if (data.profile) {
            if (data.profile.full_name) setSettingsFullName(data.profile.full_name);
            if (data.profile.city) setSettingsCity(data.profile.city);
            if (data.profile.address) setSettingsAddress(data.profile.address);
            if (data.profile.bio) setSettingsBio(data.profile.bio);
          } else if (data.full_name) {
            setSettingsFullName(data.full_name);
          }
          if (data.email) setSettingsEmail(data.email);
        })
        .catch(() => {
          if (user?.full_name) setSettingsFullName(user.full_name);
          if (user?.email) setSettingsEmail(user.email);
        });
    }
  }, [isAuthenticated, loadUserData, user]);

  // Notifications Handlers
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

  // Media upload handlers
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

  // Quick category creation inside modal
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

  // OLX-Style Selling Handler
  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);

    // Form validations
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
        condition: condition,
      });

      // 2. Upload Photos and Videos if selected
      if (mediaItems.length > 0) {
        setSubmitStep(`Media fayllar yuklanmoqda (${mediaItems.length} ta)...`);
        const filesToUpload = mediaItems.map((m) => m.file);
        await productsService.uploadMedia(product.id, filesToUpload);
      }

      // 3. Create Auction
      setSubmitStep("Auksion yaratilmoqda...");
      const startTime = new Date();
      const endTime = new Date(Date.now() + parseInt(durationDays, 10) * 86400000);

      const formattedDelivery = `${region}. ${deliveryInfo.trim()}`;

      const auction = await auctionsService.create({
        product_id: product.id,
        starting_price_uzs: startPrice,
        reserve_price_uzs: resPrice,
        min_bid_increment_uzs: minInc,
        deposit_amount_uzs: depAmt,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        delivery_info: formattedDelivery,
        rules: "G'olib 48 soat ichida qolgan summani to'lashi shart.",
      });

      // 4. Publish Auction
      setSubmitStep("Auksion faollashtirilmoqda...");
      await auctionsService.publish(auction.id);

      // Cleanup previews
      mediaItems.forEach((m) => URL.revokeObjectURL(m.previewUrl));
      setMediaItems([]);
      await loadUserData();
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

  // Settings: Profile Update Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileFeedback(null);
    try {
      await usersService.updateProfile({
        full_name: settingsFullName.trim() || undefined,
        email: settingsEmail.trim() || undefined,
        city: settingsCity || undefined,
        address: settingsAddress.trim() || undefined,
        bio: settingsBio.trim() || undefined,
      });
      await refreshUser();
      setProfileFeedback({
        type: 'success',
        message: "Profil ma'lumotlari muvaffaqiyatli saqlandi!",
      });
    } catch (err: any) {
      const raw = err.response?.data?.detail;
      const msg = typeof raw === 'string' ? raw : "Profilni yangilashda xatolik yuz berdi.";
      setProfileFeedback({ type: 'error', message: msg });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Settings: Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword.length < 8) {
      setPasswordFeedback({
        type: 'error',
        message: "Yangi parol kamida 8 ta belgidan iborat bo'lishi shart.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: "Yangi parollar bir-biriga mos kelmadi.",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordFeedback({
        type: 'success',
        message: "Parol muvaffaqiyatli yangilandi!",
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const raw = err.response?.data?.detail;
      const msg = typeof raw === 'string' ? raw : "Parolni yangilashda xatolik yuz berdi.";
      setPasswordFeedback({ type: 'error', message: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Aggregate all auctions
  const allUserAuctionsMap = new Map<string, Auction>();
  participatingAuctions.forEach((a) => allUserAuctionsMap.set(a.id, a));
  createdAuctions.forEach((a) => allUserAuctionsMap.set(a.id, a));
  wonAuctions.forEach((a) => allUserAuctionsMap.set(a.id, a));
  const allUserAuctions = Array.from(allUserAuctionsMap.values());

  // Calculations
  const lockedDeposits = deposits
    .filter((d) => d.status === 'LOCKED' || d.status === 'PAID')
    .reduce((sum, d) => sum + d.amount, 0);

  // Selected pool based on active section
  const currentPool =
    activeSection === 'market'
      ? marketAuctions
      : activeSection === 'participating'
      ? participatingAuctions
      : activeSection === 'created'
      ? createdAuctions
      : activeSection === 'won'
      ? wonAuctions
      : activeSection === 'favorites'
      ? favoriteAuctions
      : allUserAuctions;

  // Single Search, Filter & Sort Logic
  const filteredAuctions = currentPool
    .filter((auc) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = auc.product?.title?.toLowerCase().includes(q);
        const descMatch = auc.product?.description?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch) return false;
      }
      // Category filter
      if (filterCategory !== 'all') {
        if (auc.product?.category_id !== filterCategory) return false;
      }
      // Status filter
      if (filterStatus !== 'all') {
        if (auc.status !== filterStatus) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'ending_soon') {
        return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      }
      if (sortBy === 'price_asc') {
        return a.current_highest_bid - b.current_highest_bid;
      }
      if (sortBy === 'price_desc') {
        return b.current_highest_bid - a.current_highest_bid;
      }
      if (sortBy === 'bids_count') {
        return b.bid_count - a.bid_count;
      }
      // default: newest
      return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
    });

  const isAuctionView =
    activeSection === 'market' ||
    activeSection === 'participating' ||
    activeSection === 'created' ||
    activeSection === 'won' ||
    activeSection === 'favorites' ||
    activeSection === 'all_auctions';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 2-Column Dashboard Layout: Left Sidebar + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="lg:col-span-3 space-y-4">
          {/* User Profile Mini Card */}
          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20 shrink-0">
                {user?.full_name?.slice(0, 2).toUpperCase() || 'AH'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-bold text-slate-900 dark:text-slate-100 truncate text-sm">
                  {user?.full_name || t.nav.cabinet}
                </h2>
                <p className="text-xs text-slate-400 truncate">{user?.phone}</p>
                <div className="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3 h-3 mr-1 shrink-0" />
                  <span>{user?.is_verified ? t.common.verified : t.common.standard}</span>
                </div>
              </div>
            </div>

            {/* OLX-Style "Yangi lot joylash" Button */}
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="md"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center text-xs"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>{t.dashboard.postNewLot}</span>
            </Button>
          </Card>

          {/* Navigation Menu Bo'limlari */}
          <Card className="p-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/60">
            {/* Auksion bo'limlari */}
            <div className="space-y-1 p-1">
              <button
                onClick={() => handleSectionChange('market')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'market'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Gavel className="w-4 h-4 text-emerald-600" />
                  <span>{t.dashboard.activeAuctions}</span>
                </span>
                <Badge variant={activeSection === 'market' ? 'success' : 'neutral'}>
                  {marketAuctions.length}
                </Badge>
              </button>

              <button
                onClick={() => handleSectionChange('participating')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'participating'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <span>{t.dashboard.participating}</span>
                </span>
                <Badge variant={activeSection === 'participating' ? 'success' : 'neutral'}>
                  {participatingAuctions.length}
                </Badge>
              </button>

              <button
                onClick={() => handleSectionChange('created')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'created'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Package className="w-4 h-4 text-blue-500" />
                  <span>{t.dashboard.myAuctions}</span>
                </span>
                <Badge variant={activeSection === 'created' ? 'success' : 'neutral'}>
                  {createdAuctions.length}
                </Badge>
              </button>

              <button
                onClick={() => handleSectionChange('won')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'won'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>{t.dashboard.wonAuctions}</span>
                </span>
                <Badge variant={activeSection === 'won' ? 'warning' : 'neutral'}>
                  {wonAuctions.length}
                </Badge>
              </button>

              <button
                onClick={() => handleSectionChange('favorites')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'favorites'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>{t.dashboard.favorites}</span>
                </span>
                <Badge variant={activeSection === 'favorites' ? 'danger' : 'neutral'}>
                  {favoriteAuctions.length}
                </Badge>
              </button>

              <button
                onClick={() => handleSectionChange('all_auctions')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'all_auctions'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Layers className="w-4 h-4 text-purple-500" />
                  <span>{t.dashboard.allMyAuctions}</span>
                </span>
                <Badge variant="neutral">{allUserAuctions.length}</Badge>
              </button>
            </div>

            {/* Moliya va Sozlamalar */}
            <div className="space-y-1 p-1 pt-2">
              <button
                onClick={() => handleSectionChange('deposits')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'deposits'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4 text-teal-500" />
                  <span>{t.dashboard.deposits}</span>
                </span>
                <Badge variant="neutral">{deposits.length}</Badge>
              </button>

              <button
                onClick={() => handleSectionChange('notifications')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'notifications'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Bell className="w-4 h-4 text-rose-500" />
                  <span>{t.dashboard.notifications}</span>
                </span>
                {notifications.filter((n) => !n.is_read).length > 0 ? (
                  <Badge variant="danger">
                    {notifications.filter((n) => !n.is_read).length} {t.dashboard.newBadge}
                  </Badge>
                ) : (
                  <Badge variant="neutral">{notifications.length}</Badge>
                )}
              </button>

              <button
                onClick={() => handleSectionChange('settings')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeSection === 'settings'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>{t.dashboard.settings}</span>
                </span>
              </button>
            </div>
          </Card>

          {/* Balance & Wallet Widget */}
          <Card className="p-4 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white rounded-3xl shadow-xl shadow-emerald-600/15 space-y-3.5 border-none">
            <div className="flex items-center justify-between text-xs text-emerald-100/90 font-medium">
              <span className="flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5" />
                <span>{t.dashboard.walletTitle}</span>
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
            </div>

            <div>
              <div className="text-2xl font-black tracking-tight">
                {formatUZS(walletBalance?.balance_tiyin || 0)}
              </div>
              <div className="text-[11px] text-emerald-100/80 mt-1 flex items-center justify-between">
                <span>{t.dashboard.lockedDeposits}:</span>
                <span className="font-bold">
                  {formatUZS(walletBalance?.locked_deposits_tiyin || lockedDeposits)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="w-full py-2 px-3 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] transition-all font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>{t.dashboard.withdraw}</span>
            </button>
          </Card>
        </aside>

        {/* ================= MAIN CONTENT AREA ================= */}
        <main className="lg:col-span-9 space-y-6">
          {/* ================= 1. AUCTIONS VIEW (Kirishi bilanoq mahsulotlar chiqadi) ================= */}
          {isAuctionView && (
            <div className="space-y-6">
              {/* Section Title & Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">
                    {activeSection === 'market'
                      ? t.dashboard.marketTitle
                      : activeSection === 'participating'
                      ? t.dashboard.participatingTitle
                      : activeSection === 'created'
                      ? t.dashboard.createdTitle
                      : activeSection === 'won'
                      ? t.dashboard.wonTitle
                      : activeSection === 'favorites'
                      ? t.dashboard.favoritesTitle
                      : t.dashboard.allAuctionsTitle}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {activeSection === 'market'
                      ? t.dashboard.marketSubtitle
                      : activeSection === 'participating'
                      ? t.dashboard.participatingSubtitle
                      : activeSection === 'created'
                      ? t.dashboard.createdSubtitle
                      : activeSection === 'won'
                      ? t.dashboard.wonSubtitle
                      : activeSection === 'favorites'
                      ? t.dashboard.favoritesSubtitle
                      : t.dashboard.allAuctionsSubtitle}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setIsModalOpen(true)}
                    variant="primary"
                    size="sm"
                    className="shrink-0 text-xs"
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    {t.dashboard.postNewLot}
                  </Button>
                </div>
              </div>

              {/* SINGLE UNIFIED FILTER & SEARCH BAR */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {/* Single Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t.nav.searchPlaceholder}
                      className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Toifa (Category) Filter */}
                  <div className="w-full sm:w-44">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="all">{t.dashboard.allCategories}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="w-full sm:w-36">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="all">{t.dashboard.allStatuses}</option>
                      <option value="ACTIVE">{t.common.active}</option>
                      <option value="SCHEDULED">{t.dashboard.scheduledStatus}</option>
                      <option value="COMPLETED">{t.common.completed}</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div className="w-full sm:w-40">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="newest">{t.dashboard.sortNewest}</option>
                      <option value="ending_soon">{t.dashboard.sortEndingSoon}</option>
                      <option value="price_asc">{t.dashboard.sortPriceAsc}</option>
                      <option value="price_desc">{t.dashboard.sortPriceDesc}</option>
                      <option value="bids_count">{t.dashboard.sortBidsCount}</option>
                    </select>
                  </div>
                </div>

                {/* Active Filter Tags */}
                {(searchQuery || filterCategory !== 'all' || filterStatus !== 'all') && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex-wrap">
                    <span>{t.dashboard.activeFilters}</span>
                    {searchQuery && (
                      <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-lg flex items-center font-medium">
                        "{searchQuery}"
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setSearchQuery('')} />
                      </span>
                    )}
                    {filterCategory !== 'all' && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg flex items-center font-medium">
                        {categories.find((c) => c.id === filterCategory)?.name || t.common.all}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterCategory('all')} />
                      </span>
                    )}
                    {filterStatus !== 'all' && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg flex items-center font-medium">
                        {t.common.status}: {filterStatus === 'ACTIVE' ? t.common.active : filterStatus === 'COMPLETED' ? t.common.completed : filterStatus === 'SCHEDULED' ? t.dashboard.scheduledStatus : filterStatus}
                        <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => setFilterStatus('all')} />
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterCategory('all');
                        setFilterStatus('all');
                      }}
                      className="text-emerald-600 hover:underline font-semibold ml-auto text-xs"
                    >
                      {t.dashboard.clearFilters}
                    </button>
                  </div>
                )}
              </div>

              {/* AUCTION PRODUCTS LISTING / GRID */}
              {isLoadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse h-64 border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
                    </Card>
                  ))}
                </div>
              ) : filteredAuctions.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Package className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                    {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                      ? t.dashboard.emptySearchTitle
                      : activeSection === 'market'
                      ? t.dashboard.noAuctionsFound
                      : activeSection === 'participating'
                      ? t.dashboard.emptyParticipatingTitle
                      : activeSection === 'created'
                      ? t.dashboard.emptyCreatedTitle
                      : activeSection === 'won'
                      ? t.dashboard.emptyWonTitle
                      : activeSection === 'favorites'
                      ? t.dashboard.emptyFavoritesTitle
                      : t.dashboard.noAuctionsFound}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                      ? t.dashboard.emptySearchDesc
                      : activeSection === 'participating'
                      ? t.dashboard.emptyParticipatingDesc
                      : activeSection === 'favorites'
                      ? t.dashboard.emptyFavoritesDesc
                      : activeSection === 'created'
                      ? t.dashboard.emptyCreatedDesc
                      : t.dashboard.depositRefundGuarantee}
                  </p>
                  <div>
                    {activeSection === 'created' ? (
                      <Button onClick={() => setIsModalOpen(true)}>
                        <PlusCircle className="w-4 h-4 mr-1.5" />
                        {t.dashboard.postNewLot}
                      </Button>
                    ) : activeSection === 'market' ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterCategory('all');
                          setFilterStatus('all');
                        }}
                      >
                        {t.dashboard.clearFilters}
                      </Button>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Button onClick={() => handleSectionChange('market')}>
                          <Gavel className="w-4 h-4 mr-1.5" />
                          {t.dashboard.viewLot}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredAuctions.map((auc) => {
                    const rawImage = auc.product?.images?.[0]?.image_url;
                    const mediaUrl = getMediaUrl(rawImage);
                    const isVid = isVideoMedia(rawImage);

                    return (
                      <Card
                        key={auc.id}
                        className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 flex flex-col justify-between rounded-2xl group"
                      >
                        <div>
                          {/* Image / Video Media Container */}
                          <div className="relative aspect-video bg-slate-900 overflow-hidden">
                            {isVid ? (
                              <div className="w-full h-full relative">
                                <video
                                  src={mediaUrl}
                                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center">
                                    <VideoIcon className="w-3 h-3 mr-1 text-emerald-400" /> {t.dashboard.videoLot}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={mediaUrl}
                                alt={auc.product?.title || t.common.appName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            )}

                            {/* Status Badge */}
                            <div className="absolute top-2.5 left-2.5 z-10 flex items-center space-x-1.5">
                              <Badge
                                variant={
                                  auc.status === 'ACTIVE'
                                    ? 'warning'
                                    : auc.status === 'COMPLETED'
                                    ? 'success'
                                    : 'neutral'
                                }
                                className="backdrop-blur-md shadow-sm text-[10px]"
                              >
                                {auc.status === 'ACTIVE'
                                  ? t.common.active
                                  : auc.status === 'COMPLETED'
                                  ? t.common.completed
                                  : auc.status === 'SCHEDULED'
                                  ? t.dashboard.scheduledStatus
                                  : auc.status}
                              </Badge>
                            </div>

                            {/* Heart Favorite Toggle Button */}
                            <button
                              onClick={(e) => handleToggleFavorite(e, auc.id)}
                              title={favoriteIds.has(auc.id) ? t.dashboard.removeFromFavorites : t.dashboard.addToFavorites}
                              className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-lg backdrop-blur-md transition-all shadow-md ${
                                favoriteIds.has(auc.id)
                                  ? 'bg-rose-500 text-white scale-105'
                                  : 'bg-black/50 text-white hover:bg-black/80'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${favoriteIds.has(auc.id) ? 'fill-current' : ''}`} />
                            </button>

                            {/* Bottom overlay: Timer & Participants */}
                            <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between text-[10px] text-white font-medium">
                              <div className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg">
                                <CountdownTimer targetDate={auc.end_time} variant="compact" />
                              </div>
                              <div className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-lg flex items-center space-x-1">
                                <Users className="w-3 h-3 text-emerald-400" />
                                <span>{auc.participant_count || 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Card Content */}
                          <div className="p-4 space-y-2.5">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
                              {auc.product?.title || t.common.appName}
                            </h3>

                            {/* Prices */}
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                              <div className="flex items-baseline justify-between">
                                <span className="text-[11px] text-slate-500">{t.dashboard.currentBid}:</span>
                                <span className="text-sm font-extrabold text-emerald-600">
                                  {formatUZS(auc.current_highest_bid)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>{t.dashboard.startPrice}: {formatUZS(auc.starting_price)}</span>
                                <span>{t.dashboard.depositAmount}: {formatUZS(auc.deposit_amount)}</span>
                              </div>
                            </div>

                            {/* Participants & Bids Count */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                              <span className="flex items-center">
                                <Gavel className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                {auc.bid_count} {t.dashboard.bidsCount}
                              </span>
                              <span>{auc.participant_count} {t.common.participants}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Link */}
                        <div className="p-4 pt-0">
                          <Link to={`/auctions/${auc.id}`}>
                            <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-center">
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              {t.dashboard.viewLot}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= 2. DEPOSITS & WALLET VIEW ================= */}
          {activeSection === 'deposits' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">{t.dashboard.depositsPageTitle}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {t.dashboard.depositsPageSubtitle}
                  </p>
                </div>

                <Button
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  disabled={(walletBalance?.balance_uzs || 0) < 10000}
                  className="font-bold shrink-0 shadow-lg shadow-emerald-600/10"
                >
                  <ArrowUpRight className="w-4 h-4 mr-1.5" />
                  {t.dashboard.withdraw}
                </Button>
              </div>

              {/* 2 Top Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Available Balance Card */}
                <Card className="p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl shadow-xl shadow-emerald-600/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-emerald-100 font-medium">
                    <span className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4" />
                      <span>{t.dashboard.availableBalance}</span>
                    </span>
                    <Badge className="bg-white/20 text-white border-none text-[10px]">{t.dashboard.withdrawable}</Badge>
                  </div>
                  <div className="text-3xl font-black tracking-tight">
                    {formatUZS(walletBalance?.balance_tiyin || 0)}
                  </div>
                  <p className="text-[11px] text-emerald-100/90 leading-relaxed">
                    {t.dashboard.walletCardDesc}
                  </p>
                </Card>

                {/* Locked Deposits Card */}
                <Card className="p-5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xl space-y-3 border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>{t.dashboard.lockedDeposits}</span>
                    </span>
                    <Badge className="bg-amber-500/20 text-amber-300 border-none text-[10px]">{t.dashboard.frozen}</Badge>
                  </div>
                  <div className="text-3xl font-black tracking-tight text-amber-400">
                    {formatUZS(walletBalance?.locked_deposits_tiyin || lockedDeposits)}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {t.dashboard.lockedCardDesc}
                  </p>
                </Card>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => setFinanceSubTab('transactions')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    financeSubTab === 'transactions'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{t.dashboard.walletTransactions} ({walletTransactions.length})</span>
                </button>

                <button
                  onClick={() => setFinanceSubTab('withdrawals')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    financeSubTab === 'withdrawals'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{t.dashboard.withdrawHistory} ({withdrawals.length})</span>
                </button>

                <button
                  onClick={() => setFinanceSubTab('deposits')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
                    financeSubTab === 'deposits'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>{t.dashboard.auctionDeposits} ({deposits.length})</span>
                </button>
              </div>

              {/* TAB 1: Wallet Transactions */}
              {financeSubTab === 'transactions' && (
                <div className="space-y-3">
                  {walletTransactions.length === 0 ? (
                    <Card className="p-8 text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                      <Receipt className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm text-slate-500">{t.dashboard.emptyTransactionsTitle}</p>
                      <p className="text-xs text-slate-400">{t.dashboard.emptyTransactionsDesc}</p>
                    </Card>
                  ) : (
                    walletTransactions.map((tx) => (
                      <Card
                        key={tx.id}
                        className="p-4 flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              tx.is_credit
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600'
                            }`}
                          >
                            {tx.is_credit ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {tx.description}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {new Date(tx.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-extrabold text-sm ${
                              tx.is_credit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {tx.is_credit ? '+' : '-'}{formatUZS(tx.amount_tiyin)}
                          </div>
                          <Badge variant={tx.is_credit ? 'success' : 'neutral'} className="text-[10px] mt-1">
                            {tx.status === 'COMPLETED' ? t.dashboard.completedTx : tx.status}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: Withdrawals */}
              {financeSubTab === 'withdrawals' && (
                <div className="space-y-3">
                  {withdrawals.length === 0 ? (
                    <Card className="p-8 text-center space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                      <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {t.dashboard.emptyWithdrawalsTitle}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t.dashboard.emptyWithdrawalsDesc}
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsWithdrawalModalOpen(true)}
                        disabled={(walletBalance?.balance_uzs || 0) < 10000}
                        size="sm"
                      >
                        {t.dashboard.withdraw}
                      </Button>
                    </Card>
                  ) : (
                    withdrawals.map((w) => (
                      <Card
                        key={w.id}
                        className="p-4 flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                              <span>{w.card_number_masked}</span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {w.card_type}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                              <span>{new Date(w.created_at).toLocaleString()}</span>
                              {w.provider_ref && (
                                <span className="font-mono text-[10px]">• {t.dashboard.receiptNum}: {w.provider_ref}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                            {formatUZS(w.amount_tiyin)}
                          </div>
                          <Badge variant="success" className="text-[10px] mt-1">
                            {w.status === 'COMPLETED' ? t.dashboard.sentTx : w.status}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: Auction Deposits */}
              {financeSubTab === 'deposits' && (
                <div className="space-y-3">
                  {deposits.length === 0 ? (
                    <Card className="p-8 text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                      <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-sm text-slate-500">{t.dashboard.depositHistoryDesc}</p>
                    </Card>
                  ) : (
                    deposits.map((dep) => (
                      <Card
                        key={dep.id}
                        className="p-4 flex items-center justify-between bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {t.dashboard.auctionNum} #{dep.auction_id.slice(0, 8)}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(dep.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                            {formatUZS(dep.amount)}
                          </div>
                          <Badge
                            variant={
                              dep.status === 'REFUNDED'
                                ? 'neutral'
                                : dep.status === 'LOCKED' || dep.status === 'PAID'
                                ? 'warning'
                                : 'danger'
                            }
                            className="mt-1"
                          >
                            {dep.status === 'LOCKED'
                              ? t.dashboard.lockedStatus
                              : dep.status === 'REFUNDED'
                              ? t.dashboard.refundedStatus
                              : dep.status === 'PAID'
                              ? t.dashboard.paidStatus
                              : dep.status}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= 3. NOTIFICATIONS VIEW ================= */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight">{t.dashboard.notificationsTitle}</h1>
                  <p className="text-xs text-slate-500 mt-1">
                    {t.dashboard.notificationsDesc}
                  </p>
                </div>
                {notifications.some((n) => !n.is_read) && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
                    {t.dashboard.markAllAsRead}
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <Card className="p-8 text-center space-y-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500">{t.dashboard.noNotifications}</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <Card
                      key={notif.id}
                      className={`p-4 flex items-start justify-between rounded-2xl transition-all ${
                        notif.is_read
                          ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.is_read
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {notif.body}
                          </p>
                          <span className="text-[10px] text-slate-400 block">
                            {new Date(notif.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {!notif.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline shrink-0 ml-3"
                        >
                          {t.dashboard.markAsRead}
                        </button>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. SETTINGS VIEW (Sozlamalar bo'limi) ================= */}
          {activeSection === 'settings' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">{t.settings.title}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  {t.settings.subtitle}
                </p>
              </div>

              {/* Mavzu (Theme) Sozlamalari */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t.settings.appearanceTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {t.settings.appearanceSubtitle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                      theme === 'light'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${theme === 'light' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {t.settings.lightTheme}
                        </span>
                        {theme === 'light' && (
                          <Badge variant="success" className="text-[10px]">Faol</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.settings.lightThemeDesc}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start space-x-3 ${
                      theme === 'dark'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${theme === 'dark' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {t.settings.darkTheme}
                        </span>
                        {theme === 'dark' && (
                          <Badge variant="success" className="text-[10px]">Faol</Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t.settings.darkThemeDesc}
                      </p>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Til (Language) Sozlamalari */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Globe className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {t.settings.languageTitle}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {t.settings.languageSubtitle}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLanguage('uz')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center space-x-3 ${
                      language === 'uz'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="text-2xl">🇺🇿</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {t.settings.uzbek}
                        </span>
                        {language === 'uz' && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{t.settings.uzbekDesc}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('ru')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center space-x-3 ${
                      language === 'ru'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="text-2xl">🇷🇺</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {t.settings.russian}
                        </span>
                        {language === 'ru' && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{t.settings.russianDesc}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center space-x-3 ${
                      language === 'en'
                        ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {t.settings.english}
                        </span>
                        {language === 'en' && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">{t.settings.englishDesc}</p>
                    </div>
                  </button>
                </div>
              </Card>

              {/* 1. Shaxsiy profil ma'lumotlari */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.settings.profileTitle}
                  </h3>
                </div>

                {profileFeedback && (
                  <div
                    className={`p-3.5 rounded-xl flex items-center space-x-2.5 text-xs ${
                      profileFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                    }`}
                  >
                    {profileFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    )}
                    <span>{profileFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.settings.fullName}
                      </label>
                      <input
                        type="text"
                        value={settingsFullName}
                        onChange={(e) => setSettingsFullName(e.target.value)}
                        placeholder="Masalan: Anvar Karimov"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.settings.phone}
                      </label>
                      <input
                        type="text"
                        value={user?.phone || ''}
                        disabled
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.settings.email}
                      </label>
                      <input
                        type="email"
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        placeholder="example@auctionhub.uz"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.settings.region}
                      </label>
                      <select
                        value={settingsCity}
                        onChange={(e) => setSettingsCity(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {UZBEKISTAN_REGIONS.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.settings.address}
                    </label>
                    <input
                      type="text"
                      value={settingsAddress}
                      onChange={(e) => setSettingsAddress(e.target.value)}
                      placeholder="Masalan: Yunusobod tumani, 4-mavze, 12-uy, 45-xonadon"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.settings.bio}
                    </label>
                    <textarea
                      value={settingsBio}
                      onChange={(e) => setSettingsBio(e.target.value)}
                      placeholder="Sotuvchi yoki xaridor sifatidagi faoliyatingiz haqida..."
                      rows={2}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" isLoading={isSavingProfile} size="sm">
                      {t.settings.saveProfile}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 2. Xavfsizlik va Parolni o'zgartirish */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <KeyRound className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.settings.securityTitle}
                  </h3>
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3.5 rounded-xl flex items-center space-x-2.5 text-xs ${
                      passwordFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                        : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                    }`}
                  >
                    {passwordFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-lg">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.settings.currentPassword}
                    </label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.settings.newPassword}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.settings.confirmPassword}
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" isLoading={isChangingPassword} size="sm">
                      {t.settings.updatePassword}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* 3. Bildirishnoma sozlamalari */}
              <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <Bell className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {t.settings.notifSettingsTitle}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t.settings.bidOutbidNotif}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Siz qatnashayotgan yoki sotayotgan auksionda narx oshganda darhol xabar olish
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifBids}
                      onChange={(e) => setNotifBids(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t.settings.auctionEndNotif}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Auksion muddati tugaganda va g'olib aniqlanganda xabarnoma yuborish
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifWins}
                      onChange={(e) => setNotifWins(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t.settings.depositRefundNotif}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Depozit to'lovi qabul qilinganda va pul qaytarilganda bildirishnoma berish
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifDeposits}
                      onChange={(e) => setNotifDeposits(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                  </label>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* ================= OLX-STYLE SELLING MODAL (Mahsulot sotish) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {t.modal.sellProductTitle}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {t.modal.sellProductSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Feedback */}
            {modalFeedback && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 text-xs flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalFeedback}</span>
              </div>
            )}

            <form onSubmit={handleCreateAuction} className="space-y-6 text-xs">
              {/* 1-QADAM: FOTOSURATLAR VA VIDEO */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>{t.modal.mediaStep}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({mediaItems.length} {t.modal.mediaCount})
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-500">
                    {t.modal.mediaFormatHint}
                  </span>
                </div>

                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 transition-colors rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-slate-900">
                  <UploadCloud className="w-8 h-8 text-emerald-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {t.modal.uploadAreaTitle}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    {t.modal.uploadAreaSubtitle}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaFilesSelect}
                    className="hidden"
                  />
                </label>

                {/* Previews Grid */}
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
                              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
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
                                {t.modal.mainPhotoBadge}
                              </span>
                            )}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveMediaItem(idx)}
                          className="absolute top-1 right-1 p-1 rounded-lg bg-red-600 text-white opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2-QADAM: MAHSULOTNING ASOSIY MA'LUMOTLARI */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>{t.modal.detailsStep}</span>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.modal.titleLabel}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={t.modal.titlePlaceholder}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                {/* Toifa va Yangi toifa */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.categoryLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput((prev) => !prev)}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center hover:underline"
                    >
                      <FolderPlus className="w-3.5 h-3.5 mr-1" />
                      {showNewCatInput ? t.modal.cancelNewCategory : t.modal.addNewCategory}
                    </button>
                  </div>

                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {categories.length === 0 && (
                      <option value="">{t.common.loading}</option>
                    )}
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Inline Category Adder */}
                  {showNewCatInput && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                      <div className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">
                        {t.modal.addNewCategory}
                      </div>
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder={t.modal.newCategoryNamePlaceholder}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        placeholder={t.modal.newCategoryDescPlaceholder}
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
                          {t.modal.saveNewCategory}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* OLX-Style Condition Radio Cards */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.modal.conditionLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { key: 'NEW', title: t.common.new, desc: 'Qutida / New' },
                      { key: 'LIKE_NEW', title: t.common.likeNew, desc: 'Ideal / Like New' },
                      { key: 'USED', title: t.common.used, desc: 'Soz / Used' },
                    ].map((cond) => (
                      <div
                        key={cond.key}
                        onClick={() => setCondition(cond.key as ProductCondition)}
                        className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                          condition === cond.key
                            ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold">{cond.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cond.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.modal.descLabel}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t.modal.descPlaceholder}
                    rows={3}
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* 3-QADAM: AUKSION NARX SHARTLARI */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <Gavel className="w-4 h-4 text-emerald-600" />
                  <span>{t.modal.financialStep}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.startPriceLabel}
                    </label>
                    <input
                      type="number"
                      value={startingPriceUzs}
                      onChange={(e) => setStartingPriceUzs(e.target.value)}
                      required
                      min={1}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.reservePriceLabel}
                    </label>
                    <input
                      type="number"
                      value={reservePriceUzs}
                      onChange={(e) => setReservePriceUzs(e.target.value)}
                      required
                      min={1}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.minIncrementLabel}
                    </label>
                    <input
                      type="number"
                      value={minIncrementUzs}
                      onChange={(e) => setMinIncrementUzs(e.target.value)}
                      required
                      min={1}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.depositLabel}
                    </label>
                    <input
                      type="number"
                      value={depositAmountUzs}
                      onChange={(e) => setDepositAmountUzs(e.target.value)}
                      required
                      min={1}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 4-QADAM: HUDUD VA YETKAZIB BERISH (OLX STYLE) */}
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{t.modal.deliveryStep}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.regionLabel}
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      {UZBEKISTAN_REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      {t.modal.durationLabel}
                    </label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="1">1 {t.modal.daysUnit} (24h)</option>
                      <option value="3">3 {t.modal.daysUnit}</option>
                      <option value="5">5 {t.modal.daysUnit}</option>
                      <option value="7">7 {t.modal.daysUnit}</option>
                      <option value="14">14 {t.modal.daysUnit}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    {t.modal.deliveryInfoLabel}
                  </label>
                  <input
                    type="text"
                    value={deliveryInfo}
                    onChange={(e) => setDeliveryInfo(e.target.value)}
                    placeholder="Pochta, BTS, Kuryer, Samovyvoz..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Modal Footer Actions */}
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
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {submitStep || t.modal.publishBtn}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
      {/* ================= WITHDRAWAL MODAL (Pulni chiqarib olish) ================= */}
      <WithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        availableBalanceUzs={walletBalance?.balance_uzs || 0}
        onSuccess={() => {
          loadUserData();
        }}
      />
    </div>
  );
};

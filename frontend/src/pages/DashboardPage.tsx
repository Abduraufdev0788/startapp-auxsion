import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gavel,
  CreditCard,
  RotateCcw,
  PlusCircle,
  Bell,
  AlertCircle,
  X,
  Package,
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
} from '../services/api';
import { Deposit, Notification, Category } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'notifications'>('overview');
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // Create Auction Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

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
      const [depList, notifList, catList] = await Promise.all([
        depositsService.getMyDeposits().catch(() => []),
        notificationsService.list().catch(() => []),
        categoriesService.list().catch(() => []),
      ]);
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

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFeedback(null);
    setIsSubmitting(true);

    try {
      // 1. Create Product
      const product = await productsService.create({
        title,
        description,
        category_id: categoryId || categories[0]?.id,
        condition: 'NEW',
      });

      // 2. Create Auction
      const startTime = new Date();
      const endTime = new Date(Date.now() + parseInt(durationDays, 10) * 86400000);

      const auction = await auctionsService.create({
        product_id: product.id,
        starting_price_uzs: parseInt(startingPriceUzs, 10),
        reserve_price_uzs: parseInt(reservePriceUzs, 10),
        min_bid_increment_uzs: parseInt(minIncrementUzs, 10),
        deposit_amount_uzs: parseInt(depositAmountUzs, 10),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        delivery_info: deliveryInfo,
        rules: "G'olib 48 soat ichida qolgan summani to'lashi shart.",
      });

      // 3. Publish Auction
      await auctionsService.publish(auction.id);

      setIsModalOpen(false);
      navigate(`/auctions/${auction.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Auksion yaratishda xatolik yuz berdi.";
      setModalFeedback(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculations
  const lockedDeposits = deposits
    .filter((d) => d.status === 'LOCKED' || d.status === 'PAID')
    .reduce((sum, d) => sum + d.amount, 0);

  const refundedDeposits = deposits
    .filter((d) => d.status === 'REFUNDED')
    .reduce((sum, d) => sum + d.amount, 0);

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
            <p className="text-emerald-100 text-xs mt-0.5">
              {user?.phone} • {user?.is_verified ? 'Tasdiqlangan hisob' : 'Standart hisob'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="secondary"
          size="md"
          className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Yangi auksion yaratish
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Umumiy ko'rinish
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'deposits'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Depozitlar va Qaytarmalar ({deposits.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Bildirishnomalar ({notifications.filter((n) => !n.is_read).length})
        </button>
      </div>

      {/* Content */}
      {isLoadingData ? (
        <div className="py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-500">Ma'lumotlar yangilanmoqda...</p>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Jami depozitlar</span>
                <Gavel className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold">{deposits.length} ta</div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>O'qilmagan xabarlar</span>
                <Bell className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold">
                {notifications.filter((n) => !n.is_read).length} ta
              </div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Band qilingan depozit</span>
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold">{formatUZS(lockedDeposits)}</div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Qaytarilgan depozitlar</span>
                <RotateCcw className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold">{formatUZS(refundedDeposits)}</div>
            </Card>
          </div>

          {/* Recent Notifications Quick Glance */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-base">So'nggi bildirishnomalar</h3>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Hozircha yangi bildirishnomalar yo'q.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="py-3 flex items-start justify-between text-sm">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{n.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{n.body}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-xs text-emerald-600 font-medium hover:underline shrink-0 ml-4"
                      >
                        O'qildi
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {activeTab === 'deposits' && (
        <Card className="p-6">
          <h3 className="font-bold text-base mb-4">Barcha depozitlar tarixi</h3>
          {deposits.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Siz hali hech qaysi auksion uchun kafolat depoziti to'lamagansiz.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {deposits.map((d) => (
                <div key={d.id} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Auksion #{d.auction_id.slice(0, 8)}
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
      )}

      {activeTab === 'notifications' && (
        <Card className="p-6">
          <h3 className="font-bold text-base mb-4">Barcha bildirishnomalar</h3>
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Bildirishnomalar mavjud emas.</p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((n) => (
                <div key={n.id} className="py-4 flex items-start justify-between text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{n.title}</span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">{n.body}</p>
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

            <form onSubmit={handleCreateAuction} className="space-y-4 text-xs">
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

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Mahsulot tavsifi *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mahsulotning to'liq holati, parametrlari, kafolati haqida yozing..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Toifa *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Boshlang'ich narx (so'm) *
                  </label>
                  <input
                    type="number"
                    value={startingPriceUzs}
                    onChange={(e) => setStartingPriceUzs(e.target.value)}
                    required
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
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Minimal qadam (so'm) *
                  </label>
                  <input
                    type="number"
                    value={minIncrementUzs}
                    onChange={(e) => setMinIncrementUzs(e.target.value)}
                    required
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
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

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

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Auksionni e'lon qilish
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

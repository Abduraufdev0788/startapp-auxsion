import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Gavel,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Wallet,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import { adminService, auctionsService } from '../services/api';
import { Auction, Withdrawal } from '../types';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>({
    total_users: 0,
    active_auctions: 0,
    pending_moderation: 0,
    total_gmv_uzs: 0,
    open_disputes: 0,
  });
  const [pendingAuctions, setPendingAuctions] = useState<Auction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [activeTab, setActiveTab] = useState<'moderation' | 'withdrawals'>('moderation');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate('/');
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [dashData, auctionsRes, withsRes] = await Promise.allSettled([
        adminService.getDashboard(),
        auctionsService.list({ status: 'PENDING_MODERATION', page_size: 50 }),
        adminService.listWithdrawals(),
      ]);

      if (dashData.status === 'fulfilled') {
        setMetrics(dashData.value);
      }
      if (auctionsRes.status === 'fulfilled' && auctionsRes.value?.items) {
        setPendingAuctions(auctionsRes.value.items);
      }
      if (withsRes.status === 'fulfilled') {
        setWithdrawals(withsRes.value || []);
      }
    } catch {
      // keep existing state
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboard();
    }
  }, [isAdmin]);

  const handleModerate = async (auctionId: string, approved: boolean) => {
    try {
      await adminService.moderateAuction(auctionId, approved, approved ? 'Admin tasdiqladi' : 'Talablarga mos kelmadi');
      setActionFeedback(`Auksion #${auctionId.slice(0, 8)} ${approved ? 'tasdiqlandi' : 'rad etildi'}.`);
      setPendingAuctions((prev) => prev.filter((a) => a.id !== auctionId));
      loadDashboard();
    } catch (err: any) {
      setActionFeedback(err.response?.data?.detail || 'Amalni bajarishda xatolik yuz berdi.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin boshqaruv paneli</h1>
            <p className="text-slate-400 text-xs mt-0.5">
              AuctionHub platformasi xavfsizligi, moderatsiya va moliyaviy audit
            </p>
          </div>
        </div>
        <Button
          onClick={loadDashboard}
          variant="outline"
          size="sm"
          isLoading={isLoading}
          className="text-slate-200 border-slate-700 hover:bg-slate-800"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Yangilash
        </Button>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Foydalanuvchilar</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold">{metrics.total_users || 0}</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Faol auksionlar</span>
            <Gavel className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold">{metrics.active_auctions || 0}</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Kutilayotgan moderatsiya</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold">{metrics.pending_moderation || pendingAuctions.length}</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Savdo aylanmasi</span>
            <CreditCard className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-extrabold">{formatUZS(metrics.total_gmv_uzs * 100 || 0)}</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ochiq nizolar</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold">{metrics.open_disputes || 0}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('moderation')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'moderation'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Gavel className="w-4 h-4" />
          <span>Moderatsiyadagi auksionlar</span>
          {pendingAuctions.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {pendingAuctions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'withdrawals'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Pul yechib olish so'rovlari</span>
          {withdrawals.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 text-white font-bold">
              {withdrawals.length}
            </span>
          )}
        </button>
      </div>

      {/* Moderation Queue Tab */}
      {activeTab === 'moderation' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Moderatsiyadagi auksionlar navbati</h2>
            <Badge variant="warning">{pendingAuctions.length} ta kutilmoqda</Badge>
          </div>

          {pendingAuctions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ayni vaqtda barcha auksionlar ko'rib chiqilgan
              </p>
              <p className="text-xs text-slate-400">
                Yangi yaratilgan auksionlar bu yerda moderatsiya uchun paydo bo'ladi.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pendingAuctions.map((auc) => (
                <div key={auc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-bold text-base">{auc.product?.title || `Lot #${auc.id.slice(0, 8)}`}</div>
                    <div className="text-xs text-slate-500">Sotuvchi ID: {auc.seller_id}</div>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
                      <span>Boshlang'ich: {formatUZS(auc.starting_price)}</span>
                      <span>Zaxira: {formatUZS(auc.reserve_price)}</span>
                      <span>Depozit: {formatUZS(auc.deposit_amount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleModerate(auc.id, true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Tasdiqlash
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleModerate(auc.id, false)}
                      className="text-red-600 border-red-200 hover:bg-red-50 text-xs"
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Rad etish
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Withdrawals Queue Tab */}
      {activeTab === 'withdrawals' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">Bank kartasiga pul yechib olish so'rovlari</h2>
            <Badge variant="neutral">{withdrawals.length} ta yozuv</Badge>
          </div>

          {withdrawals.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Wallet className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Hozircha pul yechish so'rovlari mavjud emas
              </p>
              <p className="text-xs text-slate-400">
                Foydalanuvchilar balanslaridan pul yechganida barcha to'lovlar bu yerda ko'rinadi.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 rounded-l-xl">Sana & Vaqt</th>
                    <th className="px-4 py-3">Summa</th>
                    <th className="px-4 py-3">Karta</th>
                    <th className="px-4 py-3">Karta egasi</th>
                    <th className="px-4 py-3">Holat</th>
                    <th className="px-4 py-3 rounded-r-xl">Tranzaksiya cheki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(w.created_at).toLocaleString('uz-UZ')}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                        {w.formatted_amount || formatUZS(w.amount_tiyin)}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className="font-bold text-emerald-600">{w.card_type}</span>{' '}
                        {w.card_number_masked}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {w.card_holder || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            w.status === 'COMPLETED'
                              ? 'success'
                              : w.status === 'PENDING'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {w.status === 'COMPLETED' ? 'O\'tkazildi' : w.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-400">
                        {w.provider_ref || w.id.slice(0, 12)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

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
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';
import { useAuth } from '../app/providers';
import { adminService } from '../services/api';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<any>({
    total_users: 142,
    active_auctions: 18,
    pending_moderation_auctions: 2,
    total_deposits_volume: 4500000000,
    open_disputes: 1,
  });
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
      const data = await adminService.getDashboard();
      setMetrics(data);
    } catch {
      // keep fallback metrics
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
      await adminService.moderateAuction(auctionId, approved, approved ? 'Tasdiqlandi' : 'Rad etildi');
      setActionFeedback(`Auksion #${auctionId.slice(0, 8)} ${approved ? 'tasdiqlandi' : 'rad etildi'}.`);
      loadDashboard();
    } catch (err: any) {
      setActionFeedback(err.response?.data?.detail || 'Amalni bajarishda xatolik yuz berdi.');
    }
  };

  // Mock pending auctions for moderation demonstration
  const pendingAuctions = [
    {
      id: 'p-auc-101',
      title: 'Sony PlayStation 5 Pro 2TB (Muhrlangan)',
      seller: 'TechStore Tashkent (+998901234567)',
      starting_price: 900000000,
      reserve_price: 1100000000,
      deposit_amount: 50000000,
      created_at: new Date().toISOString(),
    },
    {
      id: 'p-auc-102',
      title: 'Rolex Submariner Date 41mm Oystersteel',
      seller: 'Luxury Timepieces LLC (+998971112233)',
      starting_price: 12000000000,
      reserve_price: 15000000000,
      deposit_amount: 1000000000,
      created_at: new Date().toISOString(),
    },
  ];

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
          <div className="text-2xl font-extrabold">{metrics.pending_moderation_auctions || 0}</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Depozitlar aylanmasi</span>
            <CreditCard className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl font-extrabold">{formatUZS(metrics.total_deposits_volume || 0)}</div>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ochiq nizolar</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-extrabold">{metrics.open_disputes || 0}</div>
        </Card>
      </div>

      {/* Moderation Queue */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Moderatsiyadagi auksionlar navbati</h2>
          <Badge variant="warning">{pendingAuctions.length} ta kutilmoqda</Badge>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {pendingAuctions.map((auc) => (
            <div key={auc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
              <div className="space-y-1">
                <div className="font-bold text-base">{auc.title}</div>
                <div className="text-xs text-slate-500">Sotuvchi: {auc.seller}</div>
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
      </Card>
    </div>
  );
};

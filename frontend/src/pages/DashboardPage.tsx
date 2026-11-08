import React, { useState } from 'react';
import {
  Gavel,
  CreditCard,
  RotateCcw,
  Trophy,
  PlusCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'participating' | 'my-auctions' | 'deposits'>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold">
            AN
          </div>
          <div>
            <h1 className="text-2xl font-bold">Alisher Navoiy</h1>
            <p className="text-emerald-100 text-xs mt-0.5">+998 90 123 45 67 • Tasdiqlangan hisob</p>
          </div>
        </div>
        <Button variant="secondary" size="md" className="shrink-0 bg-white text-emerald-800 hover:bg-emerald-50">
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
          onClick={() => setActiveTab('participating')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'participating'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Ishtirok etayotgan auksionlarim
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors ${
            activeTab === 'deposits'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Depozitlar va Qaytarmalar
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Faol ishtiroklar</span>
                <Gavel className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold">2 ta</div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Mening yutuqlarim</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold">1 ta</div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Band qilingan depozit</span>
                <CreditCard className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-extrabold">{formatUZS(80000000)}</div>
            </Card>

            <Card className="p-5 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Qaytarilgan depozitlar</span>
                <RotateCcw className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold">{formatUZS(150000000)}</div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-base mb-4">Oxirgi depozit harakatlari</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">Sony PlayStation 5 auksioni</div>
                  <div className="text-xs text-slate-400">12 Noyabr 2026, 10:14</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {formatUZS(30000000)}
                  </div>
                  <Badge variant="warning">LOCKED (Ishtirokda)</Badge>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between text-sm">
                <div>
                  <div className="font-semibold">MacBook Pro 16" M3 auksioni</div>
                  <div className="text-xs text-slate-400">08 Noyabr 2026, 16:30</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">
                    +{formatUZS(50000000)}
                  </div>
                  <Badge variant="success">REFUNDED (Qaytarildi)</Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};


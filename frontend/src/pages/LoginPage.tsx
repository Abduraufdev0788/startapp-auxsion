import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Lock, Phone, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { authService } from '../services/api';

export const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState<string>('+998');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login({ phone, password });
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Kirishda xatolik yuz berdi. Ma\'lumotlarni tekshiring.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Gavel className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Tizimga kirish</h1>
          <p className="text-xs text-slate-500">
            AuctionHub shaxsiy profilingizga kiring
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Telefon raqami
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Parol
              </label>
              <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                Parolni unutdingizmi?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full py-2.5">
            Kirish
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
          Profilingiz yo'qmi?{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            Ro'yxatdan o'tish
          </Link>
        </div>
      </Card>
    </div>
  );
};

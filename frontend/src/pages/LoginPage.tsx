import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Phone, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/common/Logo';
import { authService } from '../services/api';
import { useAuth } from '../app/providers';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState<string>('+998');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const tokens = await authService.login({ phone, password });
      await login(tokens);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail || t.auth.loginError;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <Card className="w-full max-w-md p-5 sm:p-8 space-y-5 sm:space-y-6 rounded-2xl sm:rounded-3xl">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t.auth.loginTitle}</h1>
          <p className="text-xs text-slate-500">
            {t.auth.loginSubtitle}
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
              {t.auth.phoneLabel}
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
                {t.auth.passwordLabel}
              </label>
              <Link to="/forgot-password" className="text-xs text-emerald-600 hover:underline">
                {t.auth.forgotPassword}
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
            {t.auth.loginButton}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="font-semibold text-emerald-600 hover:underline">
            {t.auth.registerLink}
          </Link>
        </div>
      </Card>
    </div>
  );
};

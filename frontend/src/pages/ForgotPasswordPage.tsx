import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Phone, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'code' | 'success'>('phone');
  const [phone, setPhone] = useState('+998');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('code');
    }, 700);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 mx-auto flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Gavel className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Parolni tiklash</h1>
          <p className="text-xs text-slate-500">
            {step === 'phone'
              ? "Telefon raqamingizni kiriting, biz tasdiqlash kodini yuboramiz"
              : step === 'code'
              ? "SMS orqali yuborilgan kodni va yangi parolingizni kiriting"
              : "Parolingiz muvaffaqiyatli yangilandi!"}
          </p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handleSendCode} className="space-y-4">
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

            <Button type="submit" isLoading={isLoading} className="w-full py-2.5">
              SMS kodni yuborish
            </Button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                SMS orqali kelgan kod
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Masalan: 123456"
                required
                className="w-full px-4 py-2.5 text-center text-lg tracking-widest font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Yangi parol
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kamida 8 ta belgi"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full py-2.5">
              Parolni o'zgartirish
            </Button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-600">
              Yangi parolingiz muvaffaqiyatli saqlandi. Endi akkauntingizga kirishingiz mumkin.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Tizimga kirish
            </Button>
          </div>
        )}

        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
          <Link
            to="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Kirish sahifasiga qaytish
          </Link>
        </div>
      </Card>
    </div>
  );
};


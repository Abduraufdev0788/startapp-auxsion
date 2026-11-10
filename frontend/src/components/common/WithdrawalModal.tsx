import React, { useState } from 'react';
import {
  CreditCard,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { paymentsService } from '../../services/api';
import { formatUZS } from '../../utils/formatters';
import { Withdrawal } from '../../types';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalanceUzs: number;
  onSuccess: (withdrawal: Withdrawal) => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
  isOpen,
  onClose,
  availableBalanceUzs,
  onSuccess,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [cardNumberRaw, setCardNumberRaw] = useState<string>('');
  const [cardHolder, setCardHolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<Withdrawal | null>(null);

  if (!isOpen) return null;

  // Format card number with spaces (e.g. 8600 1234 5678 9012)
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumberRaw(raw);
    setErrorMsg(null);
  };

  const formattedCardNumber = cardNumberRaw.replace(/(\d{4})(?=\d)/g, '$1 ');

  // Detect card brand
  const getCardBrand = (digits: string) => {
    if (digits.startsWith('8600')) return { name: 'UZCARD', color: 'bg-emerald-600 text-white' };
    if (digits.startsWith('9860')) return { name: 'HUMO', color: 'bg-amber-600 text-white' };
    if (digits.startsWith('4')) return { name: 'VISA', color: 'bg-blue-600 text-white' };
    if (digits.startsWith('5')) return { name: 'MASTERCARD', color: 'bg-rose-600 text-white' };
    return { name: 'KARTA', color: 'bg-slate-700 text-white' };
  };

  const cardBrand = getCardBrand(cardNumberRaw);
  const requestedAmount = parseInt(amountStr || '0', 10);

  const handleQuickAmount = (val: number) => {
    setAmountStr(String(Math.min(val, availableBalanceUzs)));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cardNumberRaw.length !== 16) {
      setErrorMsg("Karta raqami to'liq 16 ta raqamdan iborat bo'lishi kerak");
      return;
    }

    if (isNaN(requestedAmount) || requestedAmount < 10000) {
      setErrorMsg("Minimal yechib olish summasi 10 000 UZS");
      return;
    }

    if (requestedAmount > availableBalanceUzs) {
      setErrorMsg(`Hisobingizda yetarli mablag' mavjud emas. Maksimal: ${availableBalanceUzs.toLocaleString()} UZS`);
      return;
    }

    try {
      setIsLoading(true);
      const res = await paymentsService.withdraw({
        amount_uzs: requestedAmount,
        card_number: cardNumberRaw,
        card_holder: cardHolder.trim() || undefined,
      });
      setSuccessReceipt(res);
      onSuccess(res);
    } catch (err: any) {
      const detail = err.response?.data?.detail || "Pul yechib olishda xatolik yuz berdi";
      setErrorMsg(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessReceipt(null);
    setAmountStr('');
    setCardNumberRaw('');
    setCardHolder('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {successReceipt ? (
          /* ================= SUCCESS STATE ================= */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Mablag' muvaffaqiyatli yechildi!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pul bir necha daqiqa ichida ko'rsatilgan bank kartangizga kelib tushadi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Yechilgan summa:</span>
                <span className="font-extrabold text-base text-emerald-600">
                  {formatUZS(successReceipt.amount_tiyin)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Qabul qiluvchi karta:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {successReceipt.card_number_masked} ({successReceipt.card_type})
                </span>
              </div>
              {successReceipt.card_holder && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Karta egasi:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {successReceipt.card_holder}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Tranzaksiya cheki:</span>
                <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                  {successReceipt.provider_ref}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Komissiya:</span>
                <span className="font-semibold text-emerald-600">0 UZS (Bepul)</span>
              </div>
            </div>

            <Button onClick={handleClose} className="w-full">
              Tushundim, rahmat!
            </Button>
          </div>
        ) : (
          /* ================= WITHDRAWAL FORM ================= */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  Mablag'ni bank kartasiga yechib olish
                </h2>
                <p className="text-xs text-slate-500">
                  Yutqazilgan auksion depozitlari va shaxsiy hisobingizdagi mablag'ni chiqaring
                </p>
              </div>
            </div>

            {/* Available Balance Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md shadow-emerald-600/10">
              <div>
                <div className="text-[11px] text-emerald-100 font-medium">
                  Yechib olish uchun mavjud balans:
                </div>
                <div className="text-2xl font-extrabold tracking-tight mt-0.5">
                  {availableBalanceUzs.toLocaleString()} UZS
                </div>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-200/60" />
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 flex items-center space-x-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Amount input & Quick Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Yechib olinadigan summa (UZS) *</label>
                <span className="text-[11px] text-slate-400 font-normal">
                  Min: 10 000 UZS
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amountStr}
                  onChange={(e) => {
                    setAmountStr(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Masalan: 500000"
                  required
                  min={10000}
                  max={availableBalanceUzs}
                  className="w-full pl-3.5 pr-16 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  UZS
                </span>
              </div>

              {/* Quick select buttons */}
              <div className="flex items-center space-x-2 pt-1">
                {[100000, 500000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickAmount(val)}
                    disabled={availableBalanceUzs < val}
                    className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleQuickAmount(availableBalanceUzs)}
                  disabled={availableBalanceUzs <= 0}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold ml-auto"
                >
                  Hammasini yechish
                </button>
              </div>
            </div>

            {/* Card Number Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <label>Bank karta raqami (16 ta raqam) *</label>
                {cardNumberRaw.length > 0 && (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cardBrand.color}`}>
                    {cardBrand.name}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formattedCardNumber}
                  onChange={handleCardChange}
                  placeholder="8600 •••• •••• ••••"
                  required
                  maxLength={19}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono tracking-widest font-bold"
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] text-slate-400">
                Uzcard, Humo, Visa va Mastercard kartalari qabul qilinadi
              </p>
            </div>

            {/* Cardholder Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Karta egasining ismi-sharifi (Ixtiyoriy)
              </label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Masalan: ANVAR KARIMOV"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 uppercase"
              />
            </div>

            {/* Guarantee note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-[11px] text-slate-500">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                To'lov 1-3 daqiqada o'tkaziladi. <strong>0% komissiya</strong> — barcha bank xarajatlarini platforma qoplaydi.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Bekor qilish
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
                disabled={availableBalanceUzs < 10000 || cardNumberRaw.length !== 16}
                className="font-bold"
              >
                Pulni yechib olish
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};


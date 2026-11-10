import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ShieldCheck, HeartHandshake, Zap, Phone, Mail, Send, Award, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5 group inline-flex">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Gavel className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent">
                Lotly
              </span>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              O'zbekistondagi 1-raqamli kafolatli va shaffof onlayn auksion ekotizimi. Xaridorlar uchun arzon narxlar, sotuvchilar uchun esa yuqori bozor talabi.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                100% Qaytariluvchi Depozit
              </span>
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Award className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Rasmiy Escrow
              </span>
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Barcha auksionlar
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Qanday ishlaydi?
                </Link>
              </li>
              <li>
                <Link to="/dashboard?openModal=true" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Mahsulot sotish (+ Lot)
                </Link>
              </li>
              <li>
                <Link to="/dashboard?section=deposits" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Depozit va Hamyon
                </Link>
              </li>
            </ul>
          </div>

          {/* Guarantees & Security */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Kafolatlar
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Double-Entry shaffof hamyon</span>
              </li>
              <li className="flex items-start space-x-2">
                <HeartHandshake className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>O'zR elektron tijorat qonunchiligi</span>
              </li>
              <li className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Yutqazilganda avtomatik refund</span>
              </li>
            </ul>
          </div>

          {/* Legal & Contacts */}
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Aloqa & Qonuniy
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/terms" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Foydalanish shartlari
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Maxfiylik siyosati
                </Link>
              </li>
              <li className="pt-2 flex items-center space-x-2 text-xs text-slate-500">
                <Send className="w-3.5 h-3.5 text-emerald-500" />
                <a href="https://t.me" target="_blank" rel="noreferrer" className="hover:underline">@LotlySupportBot</a>
              </li>
              <li className="flex items-center space-x-2 text-xs text-slate-500">
                <Phone className="w-3.5 h-3.5 text-emerald-500" />
                <span>+998 (71) 200-00-00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payments Bar & Copyright */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-600 dark:text-slate-400">To'lov tizimlari:</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">Payme</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">Click</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">Uzum</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">Uzcard</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">Humo</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Lotly Marketplace. Barcha huquqlar qonun bilan himoyalangan.
          </div>
        </div>
      </div>
    </footer>
  );
};


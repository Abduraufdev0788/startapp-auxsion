import React from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-12 pb-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Gavel className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold">AuctionHub</span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              O'zbekistondagi eng yirik va ishonchli onlayn auksion savdo maydoni.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Bo'limlar</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard" className="hover:text-emerald-600">Auksionlar va Savdolar</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-600">Qanday ishlaydi?</Link></li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Kafolatlar</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Xavfsiz depozit</span>
              </li>
              <li className="flex items-center space-x-2">
                <HeartHandshake className="w-4 h-4 text-emerald-500" />
                <span>Qonuniy shartnoma</span>
              </li>
              <li className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Tezkor refund</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Qonuniy</h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/terms" className="hover:text-emerald-600">Foydalanish shartlari</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-600">Maxfiylik siyosati</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600">Bog'lanish</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} AuctionHub. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
};


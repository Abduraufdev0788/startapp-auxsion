import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gavel, Search, User, PlusCircle, LogOut, Bell, Shield, X, Sun, Moon, Globe, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../app/providers';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { notificationsService } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [navSearch, setNavSearch] = useState<string>('');
  const [langMenuOpen, setLangMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const hideNavSearch =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/auctions');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      notificationsService
        .getUnreadCount()
        .then(setUnreadCount)
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/dashboard?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/dashboard');
    }
  };

  const isAdmin = user?.roles?.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Gavel className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            AuctionHub
          </span>
        </Link>

        {/* Search (shown only on landing / other pages to avoid duplicates on search/dashboard) */}
        {!hideNavSearch && (
          <form onSubmit={handleNavSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder="Lot nomi yoki tavsifi bo'yicha qidirish..."
                className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400"
              />
              {navSearch && (
                <button
                  type="button"
                  onClick={() => setNavSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title="Tilni tanlash / Выбор языка / Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="uppercase">{language}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50">
                {(['uz', 'ru', 'en'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setLanguage(lang);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      language === lang
                        ? 'font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{lang === 'uz' ? "O'zbekcha" : lang === 'ru' ? 'Русский' : 'English'}</span>
                    {language === lang && <span className="text-emerald-600 text-xs font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? t.nav.lightMode : t.nav.darkMode}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                    <Shield className="w-4 h-4 mr-1" />
                    {t.nav.admin}
                  </Button>
                </Link>
              )}

              <Link
                to="/dashboard?section=deposits"
                title="Mening hisobim va balans"
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Hisobim</span>
              </Link>

              <Link
                to="/dashboard?section=notifications"
                title="Bildirishnomalar"
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>

              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-1.5 text-emerald-600" />
                  <span>{user.full_name?.split(' ')[0] || t.nav.cabinet}</span>
                </Button>
              </Link>

              <button
                onClick={handleLogout}
                title={t.nav.logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                  <User className="w-4 h-4 mr-1.5" />
                  {t.nav.login}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  {t.nav.register}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

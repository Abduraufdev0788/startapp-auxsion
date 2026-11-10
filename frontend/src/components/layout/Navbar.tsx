import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, PlusCircle, LogOut, Bell, Shield, X, Sun, Moon, Globe, Wallet, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { Logo } from '../common/Logo';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const hideNavSearch =
    location.pathname === '/' ||
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
        <div className="flex items-center space-x-6">
          <Logo size="md" />

          {/* Nav links on desktop */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              {t.nav.auctions}
            </Link>
            <Link
              to="/how-it-works"
              className="px-3 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Qanday ishlaydi?
            </Link>
            <Link
              to="/terms"
              className="px-3 py-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Kafolatlar
            </Link>
          </nav>
        </div>

        {/* Search (shown only on landing / other pages to avoid duplicates on search/dashboard) */}
        {!hideNavSearch && (
          <form onSubmit={handleNavSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
                placeholder={t.nav.searchPlaceholder}
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
          {/* Sell Button CTA */}
          <Link
            to={isAuthenticated ? '/dashboard?openModal=true' : '/login'}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/35 transition-all duration-200"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Sotish</span>
          </Link>
          {/* Language Switcher */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
              title="Tilni tanlash / Выбор языка / Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="uppercase text-[11px] sm:text-xs">{language}</span>
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
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 px-2 sm:px-3 text-xs">
                    <Shield className="w-3.5 h-3.5 sm:mr-1" />
                    <span className="hidden sm:inline">{t.nav.admin}</span>
                  </Button>
                </Link>
              )}

              <Link
                to="/dashboard?section=deposits"
                title={t.nav.myWallet}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.nav.myWallet}</span>
              </Link>

              <Link
                to="/dashboard?section=notifications"
                title="Bildirishnomalar"
                className="relative p-1.5 sm:p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>

              <Link to="/dashboard" title={user.full_name || t.nav.cabinet}>
                <Button variant="outline" size="sm" className="px-2 sm:px-3 text-xs">
                  <User className="w-4 h-4 text-emerald-600 sm:mr-1.5" />
                  <span className="hidden sm:inline">{user.full_name?.split(' ')[0] || t.nav.cabinet}</span>
                </Button>
              </Link>

              <button
                onClick={handleLogout}
                title={t.nav.logout}
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
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

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-xl">
          <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
            >
              <span>{t.nav.auctions}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Bozor →</span>
            </Link>
            <Link
              to="/how-it-works"
              className="px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Qanday ishlaydi?
            </Link>
            <Link
              to="/terms"
              className="px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Kafolatlar va Qoidalar
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard?section=deposits"
                  className="px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Hamyon va Kafolatlar</span>
                  </span>
                </Link>
                <Link
                  to="/dashboard?section=notifications"
                  className="px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-rose-500" />
                    <span>Bildirishnomalar</span>
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </nav>

          {/* Sell Button in Mobile Drawer */}
          <Link
            to={isAuthenticated ? '/dashboard?openModal=true' : '/login'}
            className="block w-full pt-1"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center text-xs"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              <span>+ Sotish (Yangi lot joylash)</span>
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};

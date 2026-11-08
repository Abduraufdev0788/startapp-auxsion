import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gavel, Search, User, PlusCircle, LogOut, Bell, Shield, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../app/providers';
import { notificationsService } from '../../services/api';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [navSearch, setNavSearch] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  const hideNavSearch =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/auctions');

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
      navigate(`/auctions?search=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/auctions');
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
        <div className="flex items-center space-x-3">
          <Link to="/auctions">
            <Button variant="secondary" size="sm">
              Auksionlar
            </Button>
          </Link>

          <Link to="/categories">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Toifalar
            </Button>
          </Link>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                    <Shield className="w-4 h-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}

              <Link to="/dashboard" className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>

              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <User className="w-4 h-4 mr-1.5 text-emerald-600" />
                  <span>{user.full_name?.split(' ')[0] || 'Kabinet'}</span>
                </Button>
              </Link>

              <button
                onClick={handleLogout}
                title="Tizimdan chiqish"
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
                  Kirish
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Ro'yxatdan o'tish
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

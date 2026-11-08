import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Clock,
  Users,
  ArrowUpDown,
  X,
  Film,
  Heart,
  MapPin,
  SlidersHorizontal,
  ChevronRight,
  Gavel,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';
import {
  auctionsService,
  categoriesService,
  favoritesService,
  getMediaUrl,
  isVideoMedia,
} from '../services/api';
import { Auction, Category } from '../types';
import { useAuth } from '../app/providers';

const UZBEKISTAN_REGIONS = [
  'Barcha hududlar',
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Farg\'ona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Buxoro viloyati',
  'Xorazm viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Navoiy viloyati',
  'Qoraqalpog\'iston Respublikasi',
];

export const AuctionsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('Barcha hududlar');
  const [sortBy, setSortBy] = useState<'newest' | 'ending_soon' | 'price_asc' | 'price_desc' | 'bids'>('newest');

  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  // Fallback demo items if backend database is offline or not reachable
  const fallbackAuctions: Auction[] = [
    {
      id: 'auc-001',
      seller_id: 's-1',
      product_id: 'p-1',
      starting_price: 1000000000,
      reserve_price: 1200000000,
      min_bid_increment: 10000000,
      deposit_amount: 50000000,
      current_highest_bid: 1450000000,
      bid_count: 12,
      participant_count: 8,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 14400000).toISOString(),
      status: 'ACTIVE',
      product: {
        id: 'p-1',
        seller_id: 's-1',
        category_id: 'electronics',
        title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
        description: 'LL/A yangi ochilmagan qadoqda, 1 yil rasmiy kafolat bilan. Toshkent shahri.',
        condition: 'NEW',
        is_approved: true,
        created_at: new Date().toISOString(),
        images: [
          {
            id: 'img-1',
            image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
            is_primary: true,
            display_order: 1,
          },
        ],
      },
    },
    {
      id: 'auc-002',
      seller_id: 's-2',
      product_id: 'p-2',
      starting_price: 400000000,
      reserve_price: 500000000,
      min_bid_increment: 10000000,
      deposit_amount: 30000000,
      current_highest_bid: 620000000,
      bid_count: 18,
      participant_count: 6,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 7200000).toISOString(),
      status: 'ACTIVE',
      product: {
        id: 'p-2',
        seller_id: 's-2',
        category_id: 'electronics',
        title: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
        description: 'Original yaponcha versiya, 825GB SSD, qo\'shimcha pult.',
        condition: 'LIKE_NEW',
        is_approved: true,
        created_at: new Date().toISOString(),
        images: [
          {
            id: 'img-2',
            image_url: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
            is_primary: true,
            display_order: 1,
          },
        ],
      },
    },
    {
      id: 'auc-003',
      seller_id: 's-3',
      product_id: 'p-3',
      starting_price: 19000000000,
      reserve_price: 21000000000,
      min_bid_increment: 50000000,
      deposit_amount: 1000000000,
      current_highest_bid: 21500000000,
      bid_count: 24,
      participant_count: 14,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 86400000).toISOString(),
      status: 'ACTIVE',
      product: {
        id: 'p-3',
        seller_id: 's-3',
        category_id: 'auto',
        title: 'Chevrolet Tracker 2 Premier 2023, 12 000 km',
        description: 'Holati a\'lo darajada, to\'liq kraskasiz. Premier komplektatsiya. Samarqand viloyati.',
        condition: 'USED',
        is_approved: true,
        created_at: new Date().toISOString(),
        images: [
          {
            id: 'img-3',
            image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
            is_primary: true,
            display_order: 1,
          },
        ],
      },
    },
    {
      id: 'auc-004',
      seller_id: 's-4',
      product_id: 'p-4',
      starting_price: 1800000000,
      reserve_price: 2000000000,
      min_bid_increment: 20000000,
      deposit_amount: 100000000,
      current_highest_bid: 1800000000,
      bid_count: 5,
      participant_count: 3,
      start_time: new Date().toISOString(),
      end_time: new Date(Date.now() + 259200000).toISOString(),
      status: 'ACTIVE',
      product: {
        id: 'p-4',
        seller_id: 's-4',
        category_id: 'electronics',
        title: 'Apple MacBook Pro 16 M3 Max 36GB / 1TB SSD Space Black',
        description: 'M3 Max 14-core CPU, 30-core GPU, Liquid Retina XDR displey, yangi. Toshkent shahri.',
        condition: 'NEW',
        is_approved: true,
        created_at: new Date().toISOString(),
        images: [
          {
            id: 'img-4',
            image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
            is_primary: true,
            display_order: 1,
          },
        ],
      },
    },
  ];

  // Sync state with URL
  useEffect(() => {
    const s = searchParams.get('search') || '';
    const c = searchParams.get('category') || 'all';
    setSearchQuery(s);
    setSelectedCategory(c);
  }, [searchParams]);

  const updateUrlParams = (newSearch: string, newCat: string) => {
    const nextParams = new URLSearchParams();
    if (newSearch.trim()) nextParams.set('search', newSearch.trim());
    if (newCat && newCat !== 'all') nextParams.set('category', newCat);
    setSearchParams(nextParams, { replace: true });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    startTransition(() => {
      updateUrlParams(val, selectedCategory);
    });
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    updateUrlParams(searchQuery, catId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    updateUrlParams('', selectedCategory);
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedCondition('all');
    setSelectedRegion('Barcha hududlar');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  const cIdToSlug = (id: string): string => {
    const found = categories.find((c) => c.id === id);
    return found ? found.slug : id;
  };

  // Load Categories & Favorites
  useEffect(() => {
    categoriesService
      .list()
      .then((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => {});

    if (isAuthenticated) {
      favoritesService
        .getIds()
        .then((ids) => setFavoriteIds(new Set(ids)))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const fetchAuctions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { status: 'ACTIVE' };
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await auctionsService.list(params);
      let items: Auction[] = data.items || [];
      if (items.length === 0 && !searchQuery.trim() && selectedCategory === 'all') {
        items = fallbackAuctions;
      }
      setAuctions(items);
    } catch {
      let filtered = fallbackAuctions;
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((a) => {
          const cat = a.product?.category_id;
          return cat === selectedCategory || (cIdToSlug(selectedCategory) && cat === cIdToSlug(selectedCategory));
        });
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(
          (a) =>
            a.product?.title.toLowerCase().includes(q) ||
            a.product?.description.toLowerCase().includes(q)
        );
      }
      setAuctions(filtered);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAuctions();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchAuctions]);

  // Handle Favorite Toggle
  const handleToggleFavorite = async (e: React.MouseEvent, auctionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    try {
      const res = await favoritesService.toggle(auctionId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (res.is_favorite) {
          next.add(auctionId);
        } else {
          next.delete(auctionId);
        }
        return next;
      });
    } catch (err) {
      console.error("Sevimlilarga qo'shishda xatolik:", err);
    }
  };

  // Filter & Sort Auctions locally
  const filteredAndSortedAuctions = auctions
    .filter((a) => {
      // Condition filter
      if (selectedCondition !== 'all') {
        if (a.product?.condition !== selectedCondition) return false;
      }
      // Region filter
      if (selectedRegion !== 'Barcha hududlar') {
        const desc = (a.product?.description || '').toLowerCase();
        const title = (a.product?.title || '').toLowerCase();
        const rName = selectedRegion.toLowerCase();
        if (!desc.includes(rName) && !title.includes(rName)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      }
      if (sortBy === 'ending_soon') {
        return new Date(a.end_time).getTime() - new Date(b.end_time).getTime();
      }
      if (sortBy === 'price_asc') {
        const priceA = a.current_highest_bid || a.starting_price;
        const priceB = b.current_highest_bid || b.starting_price;
        return priceA - priceB;
      }
      if (sortBy === 'price_desc') {
        const priceA = a.current_highest_bid || a.starting_price;
        const priceB = b.current_highest_bid || b.starting_price;
        return priceB - priceA;
      }
      if (sortBy === 'bids') {
        return (b.bid_count || 0) - (a.bid_count || 0);
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb & Live Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Bosh sahifa
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Auksionlar bozori
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Jonli savdo
          </span>
          <span className="text-xs text-slate-500">
            {filteredAndSortedAuctions.length} ta lot faol
          </span>
        </div>
      </div>

      {/* Main Title & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center space-x-2.5">
            <Gavel className="w-7 h-7 text-emerald-600" />
            <span>Faol Auksionlar Bozori</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tekshirilgan tovarlar, real raqobat va 100% qaytariluvchi depozit kafolati
          </p>
        </div>

        {/* Single Universal Search Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Lot nomi yoki parametr bo'yicha qidirish..."
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Barcha toifalar
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategorySelect(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Filter Controls Bar (Condition, Region, Sort, Reset) */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Condition Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-medium mr-1 hidden sm:inline flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Holati:
          </span>
          {[
            { id: 'all', label: 'Barchasi' },
            { id: 'NEW', label: 'Yangi' },
            { id: 'LIKE_NEW', label: 'Deyarli yangi' },
            { id: 'USED', label: 'Ishlatilgan' },
          ].map((cond) => (
            <button
              key={cond.id}
              onClick={() => setSelectedCondition(cond.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCondition === cond.id
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>

        {/* Right: Region & Sort Dropdowns */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Region */}
          <div className="flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs py-1.5 px-2.5 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              {UZBEKISTAN_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs py-1.5 px-2.5 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 font-medium"
            >
              <option value="newest">Yangi qo'shilganlar</option>
              <option value="ending_soon">Tugash vaqti yaqin</option>
              <option value="price_asc">Narx: arzonroq</option>
              <option value="price_desc">Narx: qimmatroq</option>
              <option value="bids">Eng ko'p taklif tushgan</option>
            </select>
          </div>

          {/* Reset Filters button if any active */}
          {(searchQuery || selectedCategory !== 'all' || selectedCondition !== 'all' || selectedRegion !== 'Barcha hududlar') && (
            <button
              onClick={handleResetAllFilters}
              className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center space-x-1 ml-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {(searchQuery || selectedCategory !== 'all' || selectedCondition !== 'all' || selectedRegion !== 'Barcha hududlar') && (
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Qidiruv filtrlari:</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Qidiruv: "{searchQuery}"
              <button onClick={handleClearSearch} className="hover:text-emerald-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Toifa: {categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}
              <button onClick={() => handleCategorySelect('all')} className="hover:text-blue-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCondition !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Holati: {selectedCondition === 'NEW' ? 'Yangi' : selectedCondition === 'LIKE_NEW' ? 'Deyarli yangi' : 'Ishlatilgan'}
              <button onClick={() => setSelectedCondition('all')} className="hover:text-amber-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedRegion !== 'Barcha hududlar' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Hudud: {selectedRegion}
              <button onClick={() => setSelectedRegion('Barcha hududlar')} className="hover:text-purple-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Auction Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200 dark:border-slate-800" />
          ))}
        </div>
      ) : filteredAndSortedAuctions.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">
              Filtrlarga mos keluvchi auksion topilmadi
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Qidiruv so'zini qisqartirib ko'ring yoki boshqa toifa va hududni tanlang.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleResetAllFilters}>
            Barcha filtrlarni tozalash
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAndSortedAuctions.map((auction) => {
            const rawUrl = auction.product?.images?.[0]?.image_url;
            const mediaUrl = getMediaUrl(rawUrl);
            const isVideo = isVideoMedia(rawUrl);
            const isFav = favoriteIds.has(auction.id);
            const condition = auction.product?.condition;

            return (
              <Card
                key={auction.id}
                className="group overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900"
              >
                {/* Media Container with Badges */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  {isVideo ? (
                    <div className="relative w-full h-full">
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full flex items-center font-medium">
                          <Film className="w-3 h-3 mr-1 text-emerald-400" /> Video e'lon
                        </span>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={mediaUrl}
                      alt={auction.product?.title || 'Mahsulot'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Top-left: Condition & Status */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <Badge
                      variant={
                        condition === 'NEW'
                          ? 'success'
                          : condition === 'LIKE_NEW'
                          ? 'info'
                          : 'neutral'
                      }
                      className="text-[10px] font-bold shadow-md uppercase tracking-wider backdrop-blur-md"
                    >
                      {condition === 'NEW'
                        ? 'Yangi'
                        : condition === 'LIKE_NEW'
                        ? 'Deyarli yangi'
                        : 'Ishlatilgan'}
                    </Badge>
                  </div>

                  {/* Top-right: Heart Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, auction.id)}
                    title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                    className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all shadow-md ${
                      isFav
                        ? 'bg-rose-500 text-white scale-110'
                        : 'bg-black/40 text-white hover:bg-black/70 hover:scale-105'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                  </button>

                  {/* Bottom overlay: Countdown & Participants */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-white">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{auction.status}</span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center space-x-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>{auction.participant_count || 0} ishtirokchi</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {auction.product?.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                      {auction.product?.description}
                    </p>
                  </div>

                  {/* Price and Deposit Box */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[11px] text-slate-400 font-medium">Joriy narx:</div>
                        <div className="text-base font-extrabold text-emerald-600">
                          {formatUZS(auction.current_highest_bid || auction.starting_price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-medium">Depozit:</div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {formatUZS(auction.deposit_amount)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link to={`/auctions/${auction.id}`} className="block pt-1">
                    <Button size="sm" className="w-full text-xs font-bold py-2 rounded-xl">
                      Taklif kiritish
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Users, ArrowUpDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';
import { auctionsService, categoriesService } from '../services/api';
import { Auction, Category } from '../types';

export const AuctionsPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fallback demo items if backend database is fresh/empty
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
        category_id: 'cat-electronics',
        title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
        description: 'LL/A yangi ochilmagan qadoqda.',
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
        category_id: 'cat-electronics',
        title: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
        description: 'Original yaponcha versiya, 825GB SSD.',
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
        category_id: 'cat-auto',
        title: 'Chevrolet Tracker 2 Premier 2023, 12 000 km',
        description: 'Holati a\'lo darajada, to\'liq kraskasiz.',
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
  ];

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
      if (data.items && data.items.length > 0) {
        setAuctions(data.items);
      } else {
        setAuctions(fallbackAuctions);
      }
    } catch {
      setAuctions(fallbackAuctions);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    categoriesService
      .list()
      .then((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faol Auksionlar</h1>
          <p className="text-sm text-slate-500 mt-1">
            Hozirda savdoda mavjud barcha tekshirilgan lotlar
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Lot nomi bo'yicha qidiruv..."
              className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchAuctions()}>
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          Barcha toifalar
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Auction Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-slate-500 font-medium">Ushbu so'rov bo'yicha hech qanday lot topilmadi.</p>
          <Button variant="outline" size="sm" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
            Filtrni tozalash
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <Link key={auction.id} to={`/auctions/${auction.id}`} className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 flex flex-col h-full">
                {/* Image & Badge */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={
                      auction.product?.images?.[0]?.image_url ||
                      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
                    }
                    alt={auction.product?.title || 'Mahsulot'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="warning" className="bg-amber-500/90 text-white border-none backdrop-blur-md px-2.5 py-1 text-xs font-bold flex items-center space-x-1">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{auction.status}</span>
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-black/60 backdrop-blur-md text-white text-[11px] px-2 py-0.5 rounded-lg flex items-center space-x-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>{auction.participant_count || 0} ishtirokchi</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {auction.product?.title || 'Lot #' + auction.id.slice(0, 8)}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs text-slate-400">Joriy eng yuqori taklif:</div>
                      <div className="text-xl font-extrabold text-emerald-600 mt-0.5">
                        {formatUZS(auction.current_highest_bid)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                      <span>Kafolat depoziti:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        {formatUZS(auction.deposit_amount)}
                      </span>
                    </div>

                    <Button size="sm" className="w-full mt-2">
                      Taklif berish
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

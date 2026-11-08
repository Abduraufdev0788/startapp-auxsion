import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowUpDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatUZS } from '../utils/formatters';

export const AuctionsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Barchasi' },
    { id: 'electronics', name: 'Elektronika' },
    { id: 'auto', name: 'Avtomobillar' },
    { id: 'realty', name: 'Ko\'chmas mulk' },
    { id: 'art', name: 'San\'at va Antikvariat' },
  ];

  const auctions = [
    {
      id: 'auc-001',
      title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
      category: 'electronics',
      categoryName: 'Elektronika',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 1450000000,
      startingPrice: 1000000000,
      depositAmount: 50000000,
      participants: 12,
      endsIn: '03:42:15',
      status: 'ACTIVE',
    },
    {
      id: 'auc-002',
      title: 'Sony PlayStation 5 Digital Edition + 2 ta DualSense',
      category: 'electronics',
      categoryName: 'Elektronika',
      imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 620000000,
      startingPrice: 400000000,
      depositAmount: 30000000,
      participants: 8,
      endsIn: '01:15:30',
      status: 'ACTIVE',
    },
    {
      id: 'auc-003',
      title: 'Chevrolet Tracker 2 Premier 2023, 12 000 km',
      category: 'auto',
      categoryName: 'Avtomobillar',
      imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      currentHighestBid: 21500000000, // 215 000 000 UZS
      startingPrice: 19000000000,
      depositAmount: 1000000000,
      participants: 23,
      endsIn: '18:30:00',
      status: 'ACTIVE',
    },
  ];

  const filteredAuctions = selectedCategory === 'all'
    ? auctions
    : auctions.filter(a => a.category === selectedCategory);

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
              placeholder="Qidiruv..."
              className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="w-4 h-4 mr-1.5" />
            Saralash
          </Button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === c.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Auctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map(item => (
          <Card key={item.id} className="group flex flex-col">
            <div className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="warning" className="backdrop-blur-md bg-amber-500/90 text-white border-none flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  <span>{item.endsIn}</span>
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <Badge variant="neutral" className="bg-black/60 text-white border-none backdrop-blur-md">
                  {item.categoryName}
                </Badge>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base line-clamp-2 text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                  {item.title}
                </h3>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Joriy eng yuqori narx:</div>
                    <div className="text-xl font-extrabold text-emerald-600">
                      {formatUZS(item.currentHighestBid)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Depozit:</div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {formatUZS(item.depositAmount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  <strong className="text-slate-900 dark:text-slate-200">{item.participants}</strong> ishtirokchi
                </span>
                <Link to={`/auctions/${item.id}`}>
                  <Button size="sm">
                    Taklif berish
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};


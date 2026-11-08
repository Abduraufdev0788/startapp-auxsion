import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Car,
  Building,
  Palette,
  Watch,
  Tv,
  ArrowRight,
  Boxes,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { categoriesService } from '../services/api';
import { Category } from '../types';
import { useAuth } from '../app/providers';

export const CategoriesPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('Cpu');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fallback demo categories if backend is fresh
  const fallbackCategories = [
    {
      id: 'electronics',
      name: 'Elektronika va Gadjetlar',
      slug: 'electronics',
      description: 'Smartfonlar, noutbuklar, planshetlar, konsollar va aksessuarlar.',
      icon: Cpu,
      count: 28,
      gradient: 'from-blue-500/10 to-indigo-500/10',
      iconColor: 'text-blue-500',
    },
    {
      id: 'auto',
      name: 'Avtomobillar va Mototexnika',
      slug: 'auto',
      description: 'Yengil avtomobillar, elektromobillar, mototsikllar va maxsus texnikalar.',
      icon: Car,
      count: 14,
      gradient: 'from-amber-500/10 to-orange-500/10',
      iconColor: 'text-amber-500',
    },
    {
      id: 'realty',
      name: "Ko'chmas mulk",
      slug: 'realty',
      description: 'Kvartiralar, shahar tashqarisidagi hovlilar va tijorat obyektlari.',
      icon: Building,
      count: 9,
      gradient: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      id: 'art',
      name: "San'at va Antikvariat",
      slug: 'art',
      description: 'Noyob san\'at asarlari, tarixiy tangalar, qo\'lyozmalar va rasmlar.',
      icon: Palette,
      count: 12,
      gradient: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-purple-500',
    },
    {
      id: 'watches',
      name: 'Zargarlik va Brend Soatlar',
      slug: 'watches',
      description: 'Shveysariya soatlari, tilla buyumlar va qimmatbaho toshlar.',
      icon: Watch,
      count: 7,
      gradient: 'from-rose-500/10 to-red-500/10',
      iconColor: 'text-rose-500',
    },
    {
      id: 'appliances',
      name: 'Maishiy texnika va Uy-ro\'zg\'or',
      slug: 'appliances',
      description: 'Muzlatgichlar, kir yuvish mashinalari, televizorlar va oshxona anjomlari.',
      icon: Tv,
      count: 18,
      gradient: 'from-cyan-500/10 to-blue-500/10',
      iconColor: 'text-cyan-500',
    },
  ];

  useEffect(() => {
    categoriesService
      .list()
      .then((data) => {
        if (data && data.length > 0) setCategories(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const getCategoryIcon = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
      case 'car':
        return Car;
      case 'building':
        return Building;
      case 'palette':
        return Palette;
      case 'watch':
        return Watch;
      case 'tv':
        return Tv;
      default:
        return Cpu;
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    setFeedback(null);
    try {
      const created = await categoriesService.create({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
        icon: newIcon,
      });
      setCategories((prev) => [created, ...prev]);
      setFeedback({ type: 'success', message: `"${created.name}" toifasi muvaffaqiyatli qo'shildi!` });
      setNewName('');
      setNewDesc('');
      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
      }, 1200);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Toifa qo'shishda xatolik yuz berdi.";
      setFeedback({ type: 'error', message: typeof msg === 'string' ? msg : JSON.stringify(msg) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-3 text-center sm:text-left">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
            <Boxes className="w-4 h-4" />
            <span>Katalog</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Auksion toifalari
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Qiziqqan yo'nalishingiz bo'yicha saralangan eng yaxshi auksion lotlari va savdolarni toping.
          </p>
        </div>

        {isAuthenticated && (
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            size="md"
            className="shrink-0 self-center sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Yangi toifa qo'shish
          </Button>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md p-6 space-y-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Yangi toifa qo'shish</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl flex items-center space-x-2.5 text-xs ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Toifa nomi *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masalan: Sport va dam olish"
                  required
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Toifa tavsifi
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Toifa haqida qisqacha ma'lumot..."
                  rows={2}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Belgi (Icon)
                </label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Cpu">Elektronika / Gadjetlar (Cpu)</option>
                  <option value="Car">Avtomobillar / Texnika (Car)</option>
                  <option value="Building">Ko'chmas mulk (Building)</option>
                  <option value="Palette">San'at / Antikvariat (Palette)</option>
                  <option value="Watch">Zargarlik / Soat (Watch)</option>
                  <option value="Tv">Maishiy texnika (Tv)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Bekor qilish
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  Saqlash
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="p-6 space-y-4 animate-pulse h-48 border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-2">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.length > 0
            ? categories.map((cat) => {
                const Icon = getCategoryIcon(cat.icon);
                return (
                  <Link
                    key={cat.id}
                    to={`/auctions?category=${cat.id}`}
                    className="group block"
                  >
                    <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between group-hover:border-emerald-500/50">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6" />
                          </div>
                          <Badge variant="neutral">Toifa</Badge>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {cat.description || 'Ushbu toifada barcha tekshirilgan lotlar.'}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600">
                        <span>Auksionlarni ko'rish</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                );
              })
            : fallbackCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={`/auctions?category=${cat.id}`}
                    className="group block"
                  >
                    <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between group-hover:border-emerald-500/50">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} ${cat.iconColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <Badge variant="neutral">{cat.count} ta lot</Badge>
                        </div>

                        <div className="space-y-1">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {cat.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-emerald-600">
                        <span>Auksionlarni ko'rish</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
        </div>
      )}
    </div>
  );
};

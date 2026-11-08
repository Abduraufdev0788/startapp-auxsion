import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Biz bilan bog'lanish
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Savollaringiz, takliflaringiz yoki qo'llab-quvvatlash xizmati bo'yicha murojaatingiz bormi? Mutaxassislarimiz tezkor javob berishadi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-4">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-base">Aloqa ma'lumotlari</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Bosh ofis</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Toshkent shahri, Yunusobod tumani, Amir Temur shox ko'chasi 107B, IT Park
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                <Phone className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Call-markaz</div>
                  <div className="text-xs text-slate-500 mt-0.5">+998 (71) 200-00-00</div>
                  <div className="text-[11px] text-slate-400">Har kuni 09:00 dan 21:00 gacha</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Elektron pochta</div>
                  <div className="text-xs text-slate-500 mt-0.5">support@auctionhub.uz</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">Telegram qo'llab-quvvatlash</div>
                  <div className="text-xs text-emerald-600 font-medium mt-0.5">@AuctionHubSupportBot</div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Feedback Form */}
        <div className="md:col-span-7">
          <Card className="p-8">
            {isSubmitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Xabaringiz qabul qilindi!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Murojaatingiz uchun rahmat. Operatorlarimiz tez orada siz ko'rsatgan telefon raqami orqali bog'lanishadi.
                </p>
                <Button variant="outline" size="sm" onClick={() => setIsSubmitted(false)}>
                  Yangi xabar yuborish
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="font-bold text-lg mb-2">Murojaat qoldirish</h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ismingiz *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Sardor Aliyev"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Telefon raqamingiz *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998901234567"
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Xabaringiz matni *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Savol yoki taklifingizni batafsil bayon qiling..."
                    required
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <Button type="submit" className="w-full py-2.5">
                  <Send className="w-4 h-4 mr-2" />
                  Xabarni yuborish
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

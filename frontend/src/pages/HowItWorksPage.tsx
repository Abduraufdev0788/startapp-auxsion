import React from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  ShieldCheck,
  CreditCard,
  Trophy,
  Truck,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: "Ro'yxatdan o'tish va identifikatsiya",
      description:
        "O'zbekiston mobil raqami (+998) orqali oson ro'yxatdan o'ting va profilingizni tasdiqlang. Platformada savdo xavfsizligini ta'minlash uchun har bir foydalanuvchi tekshiriladi.",
      icon: CheckCircle2,
      color: 'emerald',
    },
    {
      step: '02',
      title: "Kafolat depozitini to'lash",
      description:
        "Qatnashmoqchi bo'lgan auksioningiz sahifasida ko'rsatilgan kafolat depozitini Payme yoki Click orqali to'lang. Ushbu summa sizning ishtirokingizni rasmiylashtiradi va hisobingizda xavfsiz band qilinadi (LOCKED).",
      icon: CreditCard,
      color: 'blue',
    },
    {
      step: '03',
      title: "Raqobatbardosh narx takliflarini berish",
      description:
        "Auksion davomida belgilangan minimal qadamdan kam bo'lmagan summani taklif qiling. Jonli WebSocket texnologiyasi yordamida barcha takliflar va hisoblagich real vaqtda yangilanadi.",
      icon: Gavel,
      color: 'purple',
    },
    {
      step: '04',
      title: "Auksion yakuni va G'olibni aniqlash",
      description:
        "Auksion muddati tugaganda eng yuqori taklif bergan ishtirokchi g'olib deb e'lon qilinadi (agar taklif sotuvchining minimal narxiga yetgan bo'lsa).",
      icon: Trophy,
      color: 'amber',
    },
    {
      step: '05',
      title: "100% Depozit qaytarilishi yoki Xaridni rasmiylashtirish",
      description:
        "Yutmagan barcha ishtirokchilarning kafolat depozitlari auksion tugashi bilan avtomatik tarzda to'liq qaytariladi. G'olib esa 48 soat ichida qolgan summani to'lab, yetkazib berish manzilini kiritadi.",
      icon: RotateCcw,
      color: 'teal',
    },
    {
      step: '06',
      title: "Kafolatlangan yetkazib berish (Escrow)",
      description:
        "Sotuvchi tovar jo'natadi va trek-kod kiritadi. Xaridor tovar holatini tekshirib, qabul qilganini tasdiqlaganidan keyingina mablag' sotuvchiga o'tkaziladi.",
      icon: Truck,
      color: 'indigo',
    },
  ];

  const faqs = [
    {
      q: "Kafolat depoziti nega kerak va u qaytariladimi?",
      a: "Kafolat depoziti auksionda faqat jiddiy niyatli ishtirokchilar qatnashishini ta'minlash va sun'iy narx oshirish xurujlarini oldini olish uchun joriy qilingan. Agar siz yutmasangiz, depozitingiz 100% to'liq bank kartangizga qaytariladi.",
    },
    {
      q: "Anti-sniping qoidasi qanday ishlaydi?",
      a: "Agar auksion tugashiga 2 daqiqadan kam vaqt qolganda kimdir yangi yuqori taklif bersa, barcha ishtirokchilarga teng imkoniyat berish uchun tizim auksion tugash vaqtini avtomatik ravishda 5 daqiqaga uzaytiradi.",
    },
    {
      q: "G'olib to'lovni o'z vaqtida qilmasa nima bo'ladi?",
      a: "Agar auksion g'olibi belgilangan 48 soat ichida qolgan summani to'lamasa, uning kafolat depoziti platforma qoidalariga asosan musodara qilinadi va tovar 2-o'rindagi taklifchiga taklif qilinadi yoki qayta auksionga qo'yiladi.",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Shartnomaviy va xavfsiz onlayn savdo</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          AuctionHub qanday ishlaydi?
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          O'zbekistonda adolatli narx, kafolatlangan depozit va ishonchli yetkazib berish tamoyillari asosida ishlovchi birinchi auksion maydoni.
        </p>
      </div>

      {/* 6 Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((st) => {
          const Icon = st.icon;
          return (
            <Card key={st.step} className="p-6 space-y-4 relative overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-slate-200 dark:text-slate-800">
                  {st.step}
                </span>
              </div>
              <h3 className="text-lg font-bold">{st.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {st.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold flex items-center justify-center space-x-2">
            <HelpCircle className="w-6 h-6 text-emerald-600" />
            <span>Ko'p beriladigan savollar</span>
          </h2>
          <p className="text-xs text-slate-500">
            Kafolatlar va hisob-kitoblar haqida eng muhim ma'lumotlar
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i} className="p-5 space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{faq.q}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Card className="p-8 text-center space-y-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none shadow-xl">
        <h3 className="text-2xl font-extrabold">Birinchi taklifingizni bering!</h3>
        <p className="text-sm text-emerald-100 max-w-xl mx-auto">
          Bugunoq ro'yxatdan o'ting, kafolatlangan auksionlarda qatnashing va orzungizdagi tovarlarni eng maqbul narxlarda yutib oling.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link to="/auctions">
            <Button size="md" className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold">
              Auksionlarni ko'rish
            </Button>
          </Link>
          <Link to="/register">
            <Button size="md" variant="secondary" className="bg-emerald-700 text-white hover:bg-emerald-800 border-none font-bold">
              Ro'yxatdan o'tish
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

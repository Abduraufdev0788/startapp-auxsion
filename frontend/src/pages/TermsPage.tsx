import React from 'react';
import { Card } from '../components/ui/Card';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full">
          <FileText className="w-4 h-4" />
          <span>Rasmiy ommaviy oferta</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Foydalanish shartlari va Auksion qoidalari
        </h1>
        <p className="text-xs text-slate-500">
          Oxirgi tahrir: 08 Noyabr 2026 yil • O'zbekiston Respublikasi qonunchiligi asosida tuzilgan
        </p>
      </div>

      <Card className="p-8 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <span>1. Umumiy qoidalar</span>
          </h2>
          <p>
            Ushbu Shartnoma «AuctionHub» elektron auksion platformasi (keyingi o'rinlarda — «Platforma») va Platforma xizmatlaridan foydalanuvchi jismoniy yoki yuridik shaxslar (keyingi o'rinlarda — «Foydalanuvchi») o'rtasidagi munosabatlarni tartibga soladi.
          </p>
          <p>
            Platformada ro'yxatdan o'tish yoki har qanday harakatni amalga oshirish orqali Foydalanuvchi ushbu shartnoma shartlarini to'liq va so'zsiz qabul qilgan hisoblanadi (aksept).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            2. Kafolat depoziti va uning hayotiy sikli
          </h2>
          <p>
            2.1. Auksionda narx taklifini yuborish uchun Foydalanuvchi har bir auksion kartasida belgilangan miqdordagi kafolat depozitini litsenziyalangan to'lov tashkilotlari (Payme / Click / Bank) orqali to'lashi shart.
          </p>
          <p>
            2.2. Depozit quyidagi hayotiy sikl bosqichlaridan o'tadi:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <li><strong>PENDING:</strong> To'lov tashabbus qilingan, provayder tasdig'i kutilmoqda.</li>
            <li><strong>LOCKED:</strong> To'lov tasdiqlangan va auksion yakunlangunga qadar muzlatilgan.</li>
            <li><strong>REFUNDED:</strong> Auksionda yutmagan ishtirokchilarga 100% to'liq qaytarilgan.</li>
            <li><strong>APPLIED_TO_PURCHASE:</strong> G'olibning yakuniy to'lov hisobiga kiritilgan.</li>
            <li><strong>FORFEITED:</strong> G'olib belgilangan muddatda to'lovni qilmaganda musodara qilingan.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            3. Savdo qilish (Bidding) va Anti-sniping qoidalari
          </h2>
          <p>
            3.1. Har bir yangi narx taklifi auksionning joriy eng yuqori narxidan va belgilangan minimal qadam (bid increment) miqdoridan kam bo'lmasligi shart.
          </p>
          <p>
            3.2. Takliflar server tomonida qat'iy ketma-ketlik va tranzaksiyaviy qulflash (PostgreSQL SELECT ... FOR UPDATE) ostida ro'yxatga olinadi. Bir soniya ichida kelgan barcha takliflar server vaqti bo'yicha saralanadi.
          </p>
          <p>
            3.3. <strong>Anti-sniping:</strong> Agar auksion tugashiga 2 daqiqadan kam vaqt qolganda yangi taklif berilsa, auksion avtomatik tarzda qo'shimcha 5 daqiqaga uzaytiriladi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            4. G'olibning to'lovi va Yetkazib berish (Escrow)
          </h2>
          <p>
            4.1. G'olib auksion yakunlangan paytdan boshlab 48 (qirq sakkiz) soat ichida qolgan summani to'lashi va aniq yetkazib berish manzilini kiritishi shart.
          </p>
          <p>
            4.2. Xaridor to'lagan mablag' tovar unga yetkazib berilib, qabul qilinganligi tasdiqlanmaguncha yoki da'vo muddati tugamaguncha eskrou hisobida xavfsiz saqlanadi.
          </p>
          <p>
            4.3. Agar xaridor 48 soat ichida to'lovni amalga oshirmasa, uning kafolat depoziti musodara qilinadi va sotuvchiga kompensatsiya sifatida qonuniy tartibda taqsimlanadi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            5. Nizolarni hal etish
          </h2>
          <p>
            Tovarning tavsifga mos kelmasligi, shikastlanganligi yoki yetkazib berilmasligi yuzasidan barcha nizolar Platformaning Hakamlik (Disputes) bo'limi orqali foto/video dalillar asosida 3 ish kuni ichida ko'rib chiqiladi.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-xs text-slate-500">
          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>AuctionHub O'zbekiston Respublikasi elektron tijorat to'g'risidagi qonunchiligiga to'liq muvofiq faoliyat yuritadi.</span>
        </div>
      </Card>
    </div>
  );
};

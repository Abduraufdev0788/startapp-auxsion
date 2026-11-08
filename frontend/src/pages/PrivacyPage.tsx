import React from 'react';
import { Card } from '../components/ui/Card';
import { Lock, Shield } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full">
          <Lock className="w-4 h-4" />
          <span>Xavfsizlik va Ma'lumotlar himoyasi</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Maxfiylik va Shaxsiy ma'lumotlar siyosati
        </h1>
        <p className="text-xs text-slate-500">
          O'zbekiston Respublikasining «Shaxsiy ma'lumotlar to'g'risida»gi Qonuniga muvofiq
        </p>
      </div>

      <Card className="p-8 space-y-8 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            1. Qanday ma'lumotlarni yig'amiz?
          </h2>
          <p>
            Platformada xavfsiz hisob-kitoblar va qonuniy auksion savdosini amalga oshirish uchun quyidagi ma'lumotlar to'planadi:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <li>Ism, familiya va sharif;</li>
            <li>Mobil telefon raqami (+998 prefiksi bilan);</li>
            <li>Yetkazib berish manzili va pochta indeksi;</li>
            <li>Moliyaviy tranzaksiyalar identifikatorlari va depozit holati (bank kartasi ma'lumotlari bundan mustasno).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            2. To'lov xavfsizligi va Bank kartalari
          </h2>
          <p>
            <strong>Biz hech qachon foydalanuvchilarning bank kartalari raqamlari, CVV kodlari yoki to'lov parollarini serverlarimizda saqlamaymiz va ularni ko'rmaymiz.</strong>
          </p>
          <p>
            Barcha to'lovlar va depozit operatsiyalari litsenziyalangan to'lov tashkilotlarining (Payme, Click, Bank) xavfsiz va PCI-DSS xalqaro sertifikatiga ega to'lov oynalari orqali tokenizatsiya qilingan tarzda amalga oshiriladi.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            3. Ma'lumotlardan foydalanish maqsadi
          </h2>
          <p>
            Shaxsiy ma'lumotlar faqatgina:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <li>Auksion ishtirokchisi shaxsini aniqlash va qalbaki akkauntlar orqali narx oshirishning oldini olish;</li>
            <li>Yutib olingan tovarlarni sotuvchi tomonidan to'g'ri manzilga yetkazib berishini ta'minlash;</li>
            <li>Moliyaviy audit va ikki yoqlama buxgalteriya daftari hisobini yuritish uchun ishlatiladi.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            4. Ma'lumotlarni saqlash va himoya qilish
          </h2>
          <p>
            Platforma Argon2id shifrlash algoritmidan foydalanadi, parollar ochiq holda saqlanmaydi. Har bir kirish sessiyasi JWT (JSON Web Token) orqali xavfsiz himoyalangan.
          </p>
        </section>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3 text-xs text-slate-500">
          <Shield className="w-5 h-5 text-blue-500 shrink-0" />
          <span>Siz xohlagan vaqtda profilingizni to'xtatish yoki ma'lumotlaringizni o'chirish bo'yicha ma'muriyatga ariza berish huquqiga egasiz.</span>
        </div>
      </Card>
    </div>
  );
};

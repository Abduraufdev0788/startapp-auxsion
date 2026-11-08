import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-7xl font-extrabold text-emerald-600">404</h1>
      <h2 className="text-2xl font-bold mt-4">Sahifa topilmadi</h2>
      <p className="text-slate-500 text-sm mt-2 max-w-sm">
        Kechirasiz, siz qidirayotgan sahifa mavjud emas yoki boshqa manzilga ko'chirilgan.
      </p>
      <Link to="/" className="mt-6">
        <Button size="md">
          Bosh sahifaga qaytish
        </Button>
      </Link>
    </div>
  );
};


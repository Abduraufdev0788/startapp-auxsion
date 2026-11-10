import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  linkTo = '/',
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', text: 'text-lg', badge: 'text-[8px]' },
    md: { img: 'w-10 h-10', text: 'text-2xl', badge: 'text-[9px]' },
    lg: { img: 'w-12 h-12', text: 'text-3xl', badge: 'text-[10px]' },
    xl: { img: 'w-16 h-16', text: 'text-4xl', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center space-x-2.5 group ${className}`}>
      <div className={`relative ${currentSize.img} rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-lg shadow-emerald-500/10 group-hover:scale-105 group-hover:shadow-emerald-500/25 transition-all duration-300 overflow-hidden`}>
        <img
          src="/logo.png"
          alt="Lotly Logo"
          className="w-full h-full object-contain filter drop-shadow"
        />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-slate-900"></span>
        </span>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`${currentSize.text} font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 bg-clip-text text-transparent leading-none`}>
            Lotly
          </span>
          <span className={`${currentSize.badge} font-bold uppercase tracking-wider text-slate-400 mt-1`}>
            Auksion Maydoni
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
};


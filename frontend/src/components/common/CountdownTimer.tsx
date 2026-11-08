import React, { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';

export interface TimeRemaining {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
}

export function useCountdown(targetDate?: string | Date): TimeRemaining {
  const calculate = useCallback((): TimeRemaining => {
    if (!targetDate) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: '--:--:--' };
    }
    const target = new Date(targetDate).getTime();
    const diff = target - Date.now();
    if (isNaN(diff) || diff <= 0) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, formatted: '00:00:00' };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = days > 0
      ? `${days}k ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    return { total: diff, days, hours, minutes, seconds, isExpired: false, formatted };
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculate);

  useEffect(() => {
    setTimeLeft(calculate());
    const interval = setInterval(() => {
      const remaining = calculate();
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculate]);

  return timeLeft;
}

interface CountdownTimerProps {
  targetDate?: string | Date;
  variant?: 'compact' | 'detailed' | 'badge';
  className?: string;
  showIcon?: boolean;
  expiredLabel?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  variant = 'compact',
  className = '',
  showIcon = true,
  expiredLabel = 'Yakunlangan',
}) => {
  const { days, hours, minutes, seconds, isExpired, formatted } = useCountdown(targetDate);
  const pad = (n: number) => String(n).padStart(2, '0');

  if (isExpired) {
    return (
      <span className={`inline-flex items-center text-rose-500 font-semibold ${className}`}>
        {showIcon && <Clock className="w-3 h-3 mr-1 shrink-0" />}
        <span>{expiredLabel}</span>
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center space-x-1.5 font-mono ${className}`}>
        {days > 0 && (
          <div className="flex items-center">
            <span className="bg-slate-900/90 text-white px-2 py-1 rounded-md text-xs sm:text-sm font-bold shadow-inner">
              {pad(days)}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-sans mx-1">k</span>
          </div>
        )}
        <div className="flex items-center">
          <span className="bg-slate-900/90 text-white px-2 py-1 rounded-md text-xs sm:text-sm font-bold shadow-inner">
            {pad(hours)}
          </span>
          <span className="text-slate-400 mx-1">:</span>
        </div>
        <div className="flex items-center">
          <span className="bg-slate-900/90 text-white px-2 py-1 rounded-md text-xs sm:text-sm font-bold shadow-inner">
            {pad(minutes)}
          </span>
          <span className="text-slate-400 mx-1">:</span>
        </div>
        <div className="flex items-center">
          <span className="bg-emerald-600 text-white px-2 py-1 rounded-md text-xs sm:text-sm font-bold animate-pulse shadow-inner">
            {pad(seconds)}
          </span>
          <span className="text-[10px] sm:text-xs text-slate-400 font-sans ml-1">son</span>
        </div>
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span className={`inline-flex items-center font-mono ${className}`}>
        {showIcon && <Clock className="w-3.5 h-3.5 mr-1 text-amber-400 shrink-0" />}
        <span className="tracking-tight">{formatted}</span>
      </span>
    );
  }

  // default 'compact'
  return (
    <span className={`inline-flex items-center font-mono text-xs ${className}`}>
      {showIcon && <Clock className="w-3 h-3 mr-1 text-amber-400 shrink-0" />}
      <span className="tracking-tight">{formatted}</span>
    </span>
  );
};

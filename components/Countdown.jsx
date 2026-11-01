'use client';

import { useEffect, useState } from 'react';
import { timeLeft } from '@/lib/format';

export default function Countdown({ to, className = '' }) {
  const [label, setLabel] = useState(() => timeLeft(to));
  useEffect(() => {
    const t = setInterval(() => setLabel(timeLeft(to)), 30_000);
    return () => clearInterval(t);
  }, [to]);
  const urgent = new Date(to).getTime() - Date.now() < 3 * 3600 * 1000;
  return (
    <span suppressHydrationWarning className={`${urgent ? 'text-coral' : ''} ${className}`}>
      {label}
    </span>
  );
}

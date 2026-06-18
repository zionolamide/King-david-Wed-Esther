import { useState, useEffect, useMemo } from 'react';

export function useCountdown() {
  const weddingDate = useMemo(() => new Date('2026-08-22T11:00:00+01:00'), []);

  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = Math.max(weddingDate.getTime() - Date.now(), 0);
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.max(weddingDate.getTime() - Date.now(), 0);
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [weddingDate]);

  return timeLeft;
}

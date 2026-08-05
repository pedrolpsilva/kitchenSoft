'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/* ─── Timer Hook ─── KDS PedroLPS ───────────────────────────────── */

interface TimerResult {
  elapsedMinutes: number;
  elapsedFormatted: string;
}

export function useTimer(createdAt: number): TimerResult {
  const calculateElapsed = useCallback((): number => {
    return Math.floor((Date.now() - createdAt) / 60_000);
  }, [createdAt]);

  const [elapsedMinutes, setElapsedMinutes] = useState(calculateElapsed);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsedMinutes(calculateElapsed());

    intervalRef.current = setInterval(() => {
      setElapsedMinutes(calculateElapsed());
    }, 1_000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [calculateElapsed]);

  const minutes = Math.floor(elapsedMinutes);
  const totalSeconds = Math.floor((Date.now() - createdAt) / 1_000);
  const seconds = totalSeconds % 60;

  const elapsedFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { elapsedMinutes: minutes, elapsedFormatted };
}

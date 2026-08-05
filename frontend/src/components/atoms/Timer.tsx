'use client';

import React from 'react';
import { useTimer } from '@/hooks/useTimer';
import { getStatusConfig } from '@/types/order';

/* ─── Timer Atom ─── KDS PedroLPS ───────────────────────────────── */

interface TimerProps {
  createdAt: number;
}

export const Timer: React.FC<TimerProps> = ({ createdAt }) => {
  const { elapsedMinutes, elapsedFormatted } = useTimer(createdAt);
  const status = getStatusConfig(elapsedMinutes);

  return (
    <div
      className={`
        font-mono font-bold text-3xl px-2 py-1 rounded transition-colors
        ${status.alert ? 'bg-red-950/40 text-red-500 animate-kds-pulse' : `text-gray-50`}
      `}
    >
      {elapsedFormatted}
    </div>
  );
};

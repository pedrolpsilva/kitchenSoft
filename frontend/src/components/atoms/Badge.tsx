import React from 'react';
import type { OrderOrigin } from '@/types/order';

/* ─── Badge Atom ─── KDS PedroLPS ───────────────────────────────── */

interface BadgeProps {
  label: OrderOrigin | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, className = '' }) => {
  return (
    <span
      className={`inline-block px-2 py-0.5 bg-zinc-700 rounded-sm font-sans text-sm text-zinc-300 w-max select-none ${className}`}
    >
      {label}
    </span>
  );
};

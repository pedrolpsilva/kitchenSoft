import React from 'react';

/* ─── StatusDot Atom ─── KDS PedroLPS ───────────────────────────── */

interface StatusDotProps {
  isOnline: boolean;
}

export const StatusDot: React.FC<StatusDotProps> = ({ isOnline }) => {
  return (
    <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
      <span
        className={`w-3 h-3 rounded-full animate-pulse ${
          isOnline ? 'bg-emerald-500' : 'bg-red-600'
        }`}
        aria-label={isOnline ? 'Conexão ativa' : 'Sem conexão'}
      />
      <span className="font-sans text-sm font-medium text-gray-50">
        {isOnline ? 'Conectado' : 'Offline'}
      </span>
    </div>
  );
};

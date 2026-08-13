import React from 'react';
import type { ViewMode } from '@/types/order';
import { trackButtonClick } from '@/lib/analytics';

/* --- SegmentedControl Molecule --- KDS PedroLPS ------------------ */

interface SegmentedControlProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  viewMode,
  onViewChange,
}) => {
  const options: { key: ViewMode; label: string }[] = [
    { key: 'timeline', label: 'Visão Pedidos' },
    { key: 'batch', label: 'Modo Batch (Lote)' },
  ];

  const handleSelect = (key: ViewMode, label: string) => {
    trackButtonClick(`view_mode_${key}`, 'segmented_control', { label });
    onViewChange(key);
  };

  return (
    <div className="flex bg-zinc-800 p-1 rounded-lg w-full max-w-[400px]">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => handleSelect(opt.key, opt.label)}
          className={`
            flex-1 h-12 rounded-md font-sans font-bold text-base
            transition-colors duration-150 select-none
            ${
              viewMode === opt.key
                ? 'bg-gray-50 text-black'
                : 'text-zinc-400 bg-transparent'
            }
          `}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};





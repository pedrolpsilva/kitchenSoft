import React from 'react';
import { ButtonKDS } from '@/components/atoms/ButtonKDS';
import type { BatchGroup } from '@/types/order';

/* ─── BatchCard Organism ─── KDS PedroLPS ───────────────────────── */

interface BatchCardProps {
  batch: BatchGroup;
  onCompleteBatch: (itemName: string) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch, onCompleteBatch }) => {
  return (
    <article className="flex flex-col bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      {/* Header: Quantidade Total */}
      <header className="p-6 border-b border-zinc-700/50">
        <span className="font-sans font-black text-7xl text-amber-500">
          {batch.totalQty}x
        </span>
      </header>

      {/* Body: Item Name + Sources */}
      <div className="flex-1 p-6 flex flex-col gap-4">
        <h2 className="font-sans font-bold text-3xl text-gray-50">
          {batch.itemName}
        </h2>

        {/* Chips de Origem */}
        <div className="flex flex-wrap gap-2">
          {batch.sources.map((source) => (
            <span
              key={source.orderId}
              className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-700 rounded font-sans text-sm text-zinc-300"
            >
              {source.displayId}
              <span className="text-amber-500 font-bold">({source.quantity}x)</span>
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Ação */}
      <footer className="p-4 bg-zinc-900 border-t border-zinc-700">
        <ButtonKDS
          label={`CONCLUIR LOTE (${batch.totalQty})`}
          onClick={() => onCompleteBatch(batch.itemName)}
          variant="amber"
          className="h-20 text-xl"
        />
      </footer>
    </article>
  );
};

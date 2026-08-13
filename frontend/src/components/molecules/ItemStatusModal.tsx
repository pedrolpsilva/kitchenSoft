'use client';

import React from 'react';
import { CheckCircle2, Clock, X } from 'lucide-react';
import type { OrderItem } from '@/types/order';
import { trackButtonClick } from '@/lib/analytics';

/* --- ItemStatusModal Molecule --- Kitchen Soft ------------------ */

interface ItemStatusModalProps {
  isOpen: boolean;
  orderDisplayId: string;
  item: OrderItem | null;
  onConfirm: (item: OrderItem, targetStatus: 'pending' | 'ready') => void;
  onClose: () => void;
}

export const ItemStatusModal: React.FC<ItemStatusModalProps> = ({
  isOpen,
  orderDisplayId,
  item,
  onConfirm,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const isCurrentReady = item.status === 'ready';
  const targetStatus = isCurrentReady ? 'pending' : 'ready';

  const handleClose = () => {
    trackButtonClick('btn_fechar_modal_status_item', 'item_status_modal');
    onClose();
  };

  const handleConfirm = () => {
    trackButtonClick(`btn_confirmar_status_${targetStatus}`, 'item_status_modal', {
      item_id: item.id,
      item_name: item.name,
      target_status: targetStatus,
    });
    onConfirm(item, targetStatus);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex flex-col gap-6
        shadow-[8px_8px_0px_rgba(0,0,0,1)] text-gray-50 select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-700/50 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-sans font-bold text-lg text-zinc-400">
              Pedido <span className="text-gray-50 font-black">{orderDisplayId}</span>
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-zinc-400 hover:text-gray-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Item Info Card */}
        <div className="flex flex-col gap-2 p-4 bg-zinc-900 border border-zinc-700/60 rounded-md">
          <span className="font-sans text-xs text-zinc-500 uppercase tracking-wider font-semibold">
            Item selecionado
          </span>
          <div className="flex items-start gap-2">
            <span className="font-sans font-bold text-2xl text-amber-500 shrink-0">
              {item.quantity}x
            </span>
            <span className="font-sans font-bold text-xl text-gray-50">
              {item.name}
            </span>
          </div>

          {/* Status atual badge */}
          <div className="mt-1 flex items-center gap-2">
            <span className="font-sans text-xs text-zinc-400">Status atual:</span>
            {isCurrentReady ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                <CheckCircle2 size={12} /> PRONTO
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 text-xs font-medium">
                <Clock size={12} /> PENDENTE
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <p className="font-sans text-lg font-medium text-center text-zinc-200">
          {isCurrentReady
            ? 'Deseja voltar o status deste item para PENDENTE?'
            : 'Deseja marcar este item como PRONTO?'}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-14 bg-zinc-700 rounded font-sans font-bold text-base text-gray-50 hover:bg-zinc-600 transition-colors"
          >
            CANCELAR
          </button>

          <button
            onClick={handleConfirm}
            className={`flex-1 h-14 rounded font-sans font-bold text-base transition-colors flex items-center justify-center gap-2
              ${
                targetStatus === 'ready'
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-amber-500 text-black hover:bg-amber-400'
              }`}
          >
            {targetStatus === 'ready' ? (
              <>
                <CheckCircle2 size={18} />
                SIM, MARCAR PRONTO
              </>
            ) : (
              <>
                <Clock size={18} />
                VOLTAR A PENDENTE
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};




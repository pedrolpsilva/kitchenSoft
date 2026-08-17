'use client';

import React, { useMemo } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { ButtonKDS } from '@/components/atoms/ButtonKDS';
import { Timer } from '@/components/atoms/Timer';
import { OrderItemRow } from '@/components/molecules/OrderItemRow';
import { getStatusConfig } from '@/types/order';
import type { Order, OrderItem } from '@/types/order';
import { CheckCircle2 } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onMarkReady: (orderId: string) => void;
  onItemClick?: (order: Order, item: OrderItem) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onMarkReady, onItemClick }) => {
  const elapsedMinutes = useMemo(() => {
    return Math.floor((Date.now() - order.createdAt) / 60_000);
  }, [order.createdAt]);

  const status = getStatusConfig(elapsedMinutes);

  const allItemsReady = useMemo(() => {
    if (!order.items || order.items.length === 0) return false;
    return order.items.every((item) => item.status === 'ready');
  }, [order.items]);

  return (
    <article className="flex flex-col flex-shrink-0 w-[320px] max-h-[80vh] bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden shadow-[8px_8px_0px_rgba(0,0,0,1)]">
      <div className={`h-2 w-full ${status.bgClass}`} />

      <header className="flex justify-between items-start p-5 border-b border-zinc-700/50">
        <div className="flex flex-col gap-1">
          <span className="font-sans font-black text-5xl text-gray-50">
            {order.displayId}
          </span>
          <Badge label={order.origin} />
        </div>

        <Timer createdAt={order.createdAt} />
      </header>

      {allItemsReady && (
        <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span className="font-sans text-xs font-bold text-emerald-400 tracking-wide uppercase">
            Todos os itens prontos
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {order.items.map((item) => (
          <OrderItemRow
            key={item.id}
            item={item}
            onItemClick={(clickedItem) => onItemClick?.(order, clickedItem)}
          />
        ))}
      </div>

      <footer className="p-4 bg-zinc-900 border-t border-zinc-700">
        <ButtonKDS
          label="MARCAR PEDIDO PRONTO"
          onClick={() => onMarkReady(order.id)}
          variant={allItemsReady ? 'primary' : 'primary'}
        />
      </footer>
    </article>
  );
};

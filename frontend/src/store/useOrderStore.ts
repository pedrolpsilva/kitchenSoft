'use client';

import { create } from 'zustand';
import type { Order, BatchGroup, BatchSource } from '@/types/order';

/* ─── Order Store ─── KDS PedroLPS ──────────────────────────────── */

interface OrderState {
  orders: Order[];
  isLoading: boolean;

  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;
  updateOrder: (orderId: string, partial: Partial<Order>) => void;
  setLoading: (loading: boolean) => void;

  /** Computed: groups identical items across orders for Batch view */
  getBatchedOrders: () => BatchGroup[];
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  isLoading: true,

  setOrders: (orders) => set({ orders, isLoading: false }),

  addOrder: (order) =>
    set((state) => ({
      orders: [...state.orders, order],
    })),

  removeOrder: (orderId) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId),
    })),

  updateOrder: (orderId, partial) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, ...partial } : o
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  getBatchedOrders: (): BatchGroup[] => {
    const { orders } = get();
    const groupMap = new Map<string, BatchGroup>();

    for (const order of orders) {
      for (const item of order.items) {
        /* Skip items that are already marked as ready */
        if (item.status === 'ready') continue;

        const key = item.name.toLowerCase().trim();
        const existing = groupMap.get(key);

        const source: BatchSource = {
          orderId: order.id,
          displayId: order.displayId,
          quantity: item.quantity,
        };

        if (existing) {
          existing.totalQty += item.quantity;
          existing.sources.push(source);
        } else {
          groupMap.set(key, {
            itemName: item.name,
            totalQty: item.quantity,
            sources: [source],
          });
        }
      }
    }

    return Array.from(groupMap.values()).sort((a, b) => b.totalQty - a.totalQty);
  },
}));

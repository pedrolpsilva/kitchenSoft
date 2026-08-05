'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle } from 'lucide-react';
import { TopBar } from '@/components/organisms/TopBar';
import { OrderCard } from '@/components/organisms/OrderCard';
import { BatchCard } from '@/components/organisms/BatchCard';
import { BalcaoForm } from '@/components/templates/BalcaoForm';
import { ItemStatusModal } from '@/components/molecules/ItemStatusModal';
import { UserMenuDrawer } from '@/components/organisms/UserMenuDrawer';
import { useOrderStore } from '@/store/useOrderStore';
import { useFirebaseOrders } from '@/hooks/useFirebaseOrders';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { enqueueAction, initOfflineSync } from '@/lib/offlineQueue';
import {
  updateItemStatusInFirebase,
  completeBatchItemsInFirebase,
} from '@/lib/firebaseOrderItems';
import type { ViewMode, AppMode, Order, OrderItem, ItemStatus } from '@/types/order';

/* ─── KDSBoard Template ─── Kitchen Soft ───────────────────────── */

const STATION_ID = 'chapa-grelha';
const BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL ?? 'http://localhost:8585';

export const KDSBoard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [appMode, setAppMode] = useState<AppMode>('cozinha');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isOnline = useNetworkStatus();

  /* Item Status Modal State */
  const [selectedModalItem, setSelectedModalItem] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const orders = useOrderStore((s) => s.orders);
  const isLoading = useOrderStore((s) => s.isLoading);
  const removeOrder = useOrderStore((s) => s.removeOrder);
  const updateOrder = useOrderStore((s) => s.updateOrder);
  const getBatchedOrders = useOrderStore((s) => s.getBatchedOrders);

  /* Subscribe to Firebase Realtime */
  useFirebaseOrders(STATION_ID);

  /* Init offline queue flusher */
  useEffect(() => {
    const cleanup = initOfflineSync();
    return cleanup;
  }, []);

  /* Complete entire order */
  const handleMarkReady = useCallback(
    async (orderId: string) => {
      /* Optimistic removal from UI */
      removeOrder(orderId);

      if (!navigator.onLine) {
        await enqueueAction(STATION_ID, orderId);
        return;
      }

      try {
        await fetch(`${BACKEND_URL}/api/orders/${STATION_ID}/${orderId}/ready`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch {
        /* If fetch fails, enqueue for later */
        await enqueueAction(STATION_ID, orderId);
      }
    },
    [removeOrder]
  );

  /* Complete ONLY items of a batch group (Modo Lote) */
  const handleCompleteBatch = useCallback(
    async (itemName: string) => {
      /* Optimistic update in Zustand */
      const updatedOrders = orders.map((o) => ({
        ...o,
        items: o.items.map((i) =>
          i.name.toLowerCase().trim() === itemName.toLowerCase().trim()
            ? { ...i, status: 'ready' as ItemStatus }
            : i
        ),
      }));
      useOrderStore.setState({ orders: updatedOrders });

      /* Persist in Firebase Realtime DB */
      await completeBatchItemsInFirebase(STATION_ID, itemName, orders);
    },
    [orders]
  );

  /* Click on an item row opens confirmation modal */
  const handleItemClick = useCallback((order: Order, item: OrderItem) => {
    setSelectedModalItem({ order, item });
  }, []);

  /* Confirm status change in modal */
  const handleConfirmItemStatus = useCallback(
    async (item: OrderItem, targetStatus: ItemStatus) => {
      if (!selectedModalItem) return;

      const { order } = selectedModalItem;
      setSelectedModalItem(null);

      /* Optimistic update in Zustand store */
      const updatedItems = order.items.map((i) =>
        i.id === item.id ? { ...i, status: targetStatus } : i
      );
      updateOrder(order.id, { items: updatedItems });

      /* Persist in Firebase */
      await updateItemStatusInFirebase(
        STATION_ID,
        order.id,
        item.id,
        targetStatus,
        orders
      );
    },
    [selectedModalItem, orders, updateOrder]
  );

  const batchedOrders = viewMode === 'batch' ? getBatchedOrders() : [];

  return (
    <main className="flex flex-col h-screen w-screen bg-black overflow-hidden select-none">
      {/* Offline Banner */}
      {!isOnline && (
        <div className="absolute top-0 left-0 w-full h-12 bg-red-600 flex items-center justify-center z-50">
          <span className="font-sans font-bold text-gray-50 tracking-wider text-sm">
            ⚠️ CONEXÃO PERDIDA — MODO OFFLINE ATIVO (Sincronizando em background)
          </span>
        </div>
      )}

      <TopBar
        stationName="CHAPA / GRELHA"
        viewMode={viewMode}
        onViewChange={setViewMode}
        isOnline={isOnline}
        appMode={appMode}
        onAppModeChange={setAppMode}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={() => setIsUserMenuOpen((prev) => !prev)}
      />

      {/* Main layout container adapting to UserMenuDrawer */}
      <div className="flex flex-1 w-full h-[92vh] overflow-hidden">
        {/* ── Main View Container (Adapts width dynamically) ── */}
        <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col min-w-0 transition-all duration-300">
          {/* Modo Cozinha (KDS) */}
          {appMode === 'cozinha' && (
            <section className="flex-1 relative w-full h-full overflow-hidden">
              {/* Estado 1: Loading Skeleton */}
              {isLoading && (
                <div className="flex gap-6 p-6 h-full animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-[320px] h-3/4 bg-zinc-800 rounded-md border border-zinc-700"
                    />
                  ))}
                </div>
              )}

              {/* Estado 2: Empty State (Fila Limpa) */}
              {!isLoading && orders.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                  <CheckCircle
                    size={96}
                    strokeWidth={1.5}
                    className="text-zinc-700"
                  />
                  <h2 className="font-sans text-2xl text-zinc-400">
                    Fila limpa. Bom trabalho.
                  </h2>
                  <p className="font-sans text-emerald-500 font-medium">
                    Tempo médio de hoje: 11m 45s
                  </p>
                </div>
              )}

              {/* Estado 3: Timeline Horizontal */}
              {!isLoading && orders.length > 0 && viewMode === 'timeline' && (
                <div className="flex flex-row gap-6 p-6 h-full w-full overflow-x-auto custom-scrollbar-x pb-8">
                  {orders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onMarkReady={handleMarkReady}
                      onItemClick={handleItemClick}
                    />
                  ))}
                </div>
              )}

              {/* Estado 4: Batch Grid */}
              {!isLoading && orders.length > 0 && viewMode === 'batch' && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-8 p-6 h-full w-full overflow-y-auto custom-scrollbar">
                  {batchedOrders.map((batch) => (
                    <BatchCard
                      key={batch.itemName}
                      batch={batch}
                      onCompleteBatch={handleCompleteBatch}
                    />
                  ))}
                </div>
              )}

              {/* Modal para confirmação de status de item */}
              <ItemStatusModal
                isOpen={selectedModalItem !== null}
                orderDisplayId={selectedModalItem?.order.displayId ?? ''}
                item={selectedModalItem?.item ?? null}
                onConfirm={handleConfirmItemStatus}
                onClose={() => setSelectedModalItem(null)}
              />
            </section>
          )}

          {/* Modo Balcão (Registro de Pedidos) */}
          {appMode === 'balcao' && <BalcaoForm />}
        </div>

        {/* ── User Menu Drawer (Expands right-to-left below header) ── */}
        <UserMenuDrawer
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
        />
      </div>
    </main>
  );
};

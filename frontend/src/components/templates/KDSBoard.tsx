'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  markOrderReadyInFirebase,
} from '@/lib/firebaseOrderItems';
import type { ViewMode, AppMode, Order, OrderItem, ItemStatus } from '@/types/order';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';
import { trackUserLoginLocation } from '@/lib/analytics';

const STATION_ID = 'chapa-grelha';
const BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL ?? 'http://localhost:8585';

export const KDSBoard: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [appMode, setAppMode] = useState<AppMode>('cozinha');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const isOnline = useNetworkStatus();
  const username = useAuthStore((s) => s.username) || 'admin';
  const tenantId = useTenantStore((s) => s.tenantId);
  const isProfileLoaded = useTenantStore((s) => s.isProfileLoaded);
  const hasPermission = useTenantStore((s) => s.hasPermission);
  const role = useTenantStore((s) => s.role);

  const [selectedModalItem, setSelectedModalItem] = useState<{
    order: Order;
    item: OrderItem;
  } | null>(null);

  const orders = useOrderStore((s) => s.orders);
  const isLoading = useOrderStore((s) => s.isLoading);
  const removeOrder = useOrderStore((s) => s.removeOrder);
  const updateOrder = useOrderStore((s) => s.updateOrder);
  const getBatchedOrders = useOrderStore((s) => s.getBatchedOrders);

  useFirebaseOrders(STATION_ID);

  useEffect(() => {
    trackUserLoginLocation(username);
    const cleanup = initOfflineSync();
    return cleanup;
  }, [username]);

  useEffect(() => {
    if (!isProfileLoaded) return;

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const modeParam = params?.get('mode') as AppMode | null;

    if (role === 'admin') {
      if (modeParam && (modeParam === 'cozinha' || modeParam === 'balcao')) {
        setAppMode(modeParam);
      }
      return;
    }

    const canCozinha = hasPermission('tela_cozinha');
    const canBalcao = hasPermission('tela_balcao');
    const canSalao = hasPermission('tela_salao');

    if (modeParam === 'balcao' && canBalcao) {
      setAppMode('balcao');
    } else if (modeParam === 'cozinha' && canCozinha) {
      setAppMode('cozinha');
    } else if (canCozinha) {
      setAppMode('cozinha');
    } else if (canBalcao) {
      setAppMode('balcao');
    } else if (canSalao) {
      router.replace('/salao');
    }
  }, [isProfileLoaded, role, hasPermission, router]);

  const handleMarkReady = useCallback(
    async (orderId: string) => {
      removeOrder(orderId);

      if (!navigator.onLine) {
        await enqueueAction(STATION_ID, orderId);
        return;
      }

      try {
        let sent = false;

        try {
          const res = await fetch(
            `${BACKEND_URL}/api/orders/${STATION_ID}/${orderId}/ready?tenantId=${tenantId}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
            }
          );
          if (res.ok) {
            sent = true;
          }
        } catch {
        }

        if (!sent) {
          await markOrderReadyInFirebase(STATION_ID, orderId);
        }
      } catch (err) {
        console.error('[KDS] Erro ao marcar comanda como pronta:', err);
        await enqueueAction(STATION_ID, orderId);
      }
    },
    [removeOrder, tenantId]
  );

  const handleCompleteBatch = useCallback(
    async (itemName: string) => {
      const updatedOrders = orders.map((o) => ({
        ...o,
        items: o.items.map((i) =>
          i.name.toLowerCase().trim() === itemName.toLowerCase().trim()
            ? { ...i, status: 'ready' as ItemStatus }
            : i
        ),
      }));
      useOrderStore.setState({ orders: updatedOrders });

      await completeBatchItemsInFirebase(STATION_ID, itemName, orders);
    },
    [orders]
  );

  const handleItemClick = useCallback((order: Order, item: OrderItem) => {
    setSelectedModalItem({ order, item });
  }, []);

  const handleConfirmItemStatus = useCallback(
    async (item: OrderItem, targetStatus: ItemStatus) => {
      if (!selectedModalItem) return;

      const { order } = selectedModalItem;
      setSelectedModalItem(null);

      const updatedItems = order.items.map((i) =>
        i.id === item.id ? { ...i, status: targetStatus } : i
      );
      updateOrder(order.id, { items: updatedItems });

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

  const canAccessCurrentMode = role === 'admin' || (
    appMode === 'cozinha' ? hasPermission('tela_cozinha') :
    appMode === 'balcao' ? hasPermission('tela_balcao') : false
  );

  return (
    <main className="flex flex-col h-screen w-screen bg-black overflow-hidden select-none">
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

      <div className="flex flex-1 w-full h-[92vh] overflow-hidden">
        <div className="flex-1 relative w-full h-full overflow-hidden flex flex-col min-w-0 transition-all duration-300">
          {!canAccessCurrentMode && (
            <div className="flex flex-col items-center justify-center w-full h-full gap-4 text-center px-4">
              <ShieldAlert size={64} className="text-zinc-600" />
              <h2 className="font-sans text-xl font-bold text-zinc-300">
                Acesso Não Permitido
              </h2>
              <p className="font-sans text-sm text-zinc-500 max-w-sm">
                Seu usuário não possui permissão para visualizar este módulo. Solicite acesso ao administrador.
              </p>
            </div>
          )}

          {canAccessCurrentMode && appMode === 'cozinha' && (
            <section className="flex-1 relative w-full h-full overflow-hidden">
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

              <ItemStatusModal
                isOpen={selectedModalItem !== null}
                orderDisplayId={selectedModalItem?.order.displayId ?? ''}
                item={selectedModalItem?.item ?? null}
                onConfirm={handleConfirmItemStatus}
                onClose={() => setSelectedModalItem(null)}
              />
            </section>
          )}

          {canAccessCurrentMode && appMode === 'balcao' && <BalcaoForm />}
        </div>

        <UserMenuDrawer
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
        />
      </div>
    </main>
  );
};

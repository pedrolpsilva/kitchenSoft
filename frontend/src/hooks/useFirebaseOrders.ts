'use client';

import { useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useOrderStore } from '@/store/useOrderStore';
import { useTenantStore } from '@/store/useTenantStore';
import type { Order } from '@/types/order';

/* ─── Firebase Realtime Listener ─── KDS PedroLPS ───────────────── */

export function useFirebaseOrders(stationId: string): void {
  const setOrders = useOrderStore((s) => s.setOrders);
  const setLoading = useOrderStore((s) => s.setLoading);
  const tenantId = useTenantStore((s) => s.tenantId);

  useEffect(() => {
    if (!stationId || !tenantId) return;

    setLoading(true);
    const ordersRef = ref(database, `tenants/${tenantId}/stations/${stationId}/orders`);

    const unsubscribe = onValue(
      ordersRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrders([]);
          return;
        }

        const data = snapshot.val() as Record<string, Order>;
        const orders = Object.values(data).filter(
          (order) => order.status === 'pending'
        );

        /* Sort by createdAt ASC — oldest on the left */
        orders.sort((a, b) => a.createdAt - b.createdAt);
        setOrders(orders);
      },
      (error) => {
        console.error('[KDS] Firebase listener error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [stationId, tenantId, setOrders, setLoading]);
}

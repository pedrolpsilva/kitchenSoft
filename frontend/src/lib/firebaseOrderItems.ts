import { ref, update, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useTenantStore } from '@/store/useTenantStore';
import type { Order, ItemStatus, OrderOrigin, OrderItem, OrderStatus } from '@/types/order';

function getTenantId(): string {
  const tenantId = useTenantStore.getState().tenantId;
  if (!tenantId) throw new Error('[firebaseOrderItems] tenantId não disponível');
  return tenantId;
}

export async function createOrderInFirebase(
  stationId: string,
  orderData: {
    displayId: string;
    origin: OrderOrigin;
    items: OrderItem[];
    tenantId?: string;
  }
): Promise<Order> {
  const tenantId = orderData.tenantId || getTenantId();
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const order: Order = {
    id: orderId,
    displayId: orderData.displayId,
    origin: orderData.origin,
    createdAt: Date.now(),
    status: 'pending',
    stationId,
    items: orderData.items.map((item, idx) => ({
      ...item,
      id: item.id || `item_${idx + 1}`,
      status: item.status || 'pending',
    })),
  };

  const orderRef = ref(database, `tenants/${tenantId}/stations/${stationId}/orders/${orderId}`);
  await set(orderRef, order);
  return order;
}

export async function updateItemStatusInFirebase(
  stationId: string,
  orderId: string,
  itemId: string,
  newStatus: ItemStatus,
  orders: Order[]
): Promise<void> {
  const tenantId = getTenantId();
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  const updatedItems = order.items.map((item) =>
    item.id === itemId ? { ...item, status: newStatus } : item
  );

  const orderRef = ref(database, `tenants/${tenantId}/stations/${stationId}/orders/${orderId}`);
  await update(orderRef, { items: updatedItems });
}

export async function completeBatchItemsInFirebase(
  stationId: string,
  itemName: string,
  orders: Order[]
): Promise<void> {
  const tenantId = getTenantId();
  const dbUpdates: Record<string, any> = {};

  for (const order of orders) {
    let modified = false;
    const updatedItems = order.items.map((item) => {
      if (
        item.name.toLowerCase().trim() === itemName.toLowerCase().trim() &&
        item.status !== 'ready'
      ) {
        modified = true;
        return { ...item, status: 'ready' as const };
      }
      return item;
    });

    if (modified) {
      dbUpdates[`tenants/${tenantId}/stations/${stationId}/orders/${order.id}/items`] = updatedItems;
    }
  }

  if (Object.keys(dbUpdates).length > 0) {
    const rootRef = ref(database);
    await update(rootRef, dbUpdates);
  }
}

export async function updateOrderStatusInFirebase(
  stationId: string,
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  const tenantId = getTenantId();
  const orderRef = ref(database, `tenants/${tenantId}/stations/${stationId}/orders/${orderId}`);
  await update(orderRef, {
    status: newStatus,
    completedAt: newStatus === 'ready' ? Date.now() : null,
  });
}

export async function markOrderReadyInFirebase(
  stationId: string,
  orderId: string
): Promise<void> {
  return updateOrderStatusInFirebase(stationId, orderId, 'ready');
}

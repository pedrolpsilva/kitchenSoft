import { ref, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import type { Order, ItemStatus } from '@/types/order';

/**
 * Updates a single item's status in a specific order in Firebase Realtime DB.
 */
export async function updateItemStatusInFirebase(
  stationId: string,
  orderId: string,
  itemId: string,
  newStatus: ItemStatus,
  orders: Order[]
): Promise<void> {
  const order = orders.find((o) => o.id === orderId);
  if (!order) return;

  const updatedItems = order.items.map((item) =>
    item.id === itemId ? { ...item, status: newStatus } : item
  );

  const orderRef = ref(database, `stations/${stationId}/orders/${orderId}`);
  await update(orderRef, { items: updatedItems });
}

/**
 * Marks ALL pending items matching `itemName` as 'ready' across all orders in the station.
 * Used when "CONCLUIR LOTE" is pressed in Modo Lote.
 */
export async function completeBatchItemsInFirebase(
  stationId: string,
  itemName: string,
  orders: Order[]
): Promise<void> {
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
      dbUpdates[`stations/${stationId}/orders/${order.id}/items`] = updatedItems;
    }
  }

  if (Object.keys(dbUpdates).length > 0) {
    const rootRef = ref(database);
    await update(rootRef, dbUpdates);
  }
}

import localforage from 'localforage';
import { useTenantStore } from '@/store/useTenantStore';

/* ─── Offline Action Queue ─── KDS PedroLPS ─────────────────────── */

interface QueuedAction {
  id: string;
  type: 'MARK_READY';
  stationId: string;
  orderId: string;
  tenantId: string;
  timestamp: number;
}

const QUEUE_KEY = 'kds_offline_queue';
const BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL ?? 'http://localhost:8585';

const store = localforage.createInstance({
  name: 'kds-avigium',
  storeName: 'offline_queue',
});

async function getQueue(): Promise<QueuedAction[]> {
  const queue = await store.getItem<QueuedAction[]>(QUEUE_KEY);
  return queue ?? [];
}

async function saveQueue(queue: QueuedAction[]): Promise<void> {
  await store.setItem(QUEUE_KEY, queue);
}

export async function enqueueAction(stationId: string, orderId: string): Promise<void> {
  const tenantId = useTenantStore.getState().tenantId || '';
  const queue = await getQueue();
  const action: QueuedAction = {
    id: `${orderId}_${Date.now()}`,
    type: 'MARK_READY',
    stationId,
    orderId,
    tenantId,
    timestamp: Date.now(),
  };
  queue.push(action);
  await saveQueue(queue);
}

async function processAction(action: QueuedAction): Promise<boolean> {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/orders/${action.stationId}/${action.orderId}/ready?tenantId=${action.tenantId}`,
      { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function flushQueue(): Promise<void> {
  const queue = await getQueue();
  if (queue.length === 0) return;

  const remaining: QueuedAction[] = [];

  for (const action of queue) {
    const success = await processAction(action);
    if (!success) {
      remaining.push(action);
    }
  }

  await saveQueue(remaining);
}

export function initOfflineSync(): () => void {
  const handleOnline = () => {
    flushQueue();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
    }
  };
}

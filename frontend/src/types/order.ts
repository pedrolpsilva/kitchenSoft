/* ─── Domain Types ─── KDS PedroLPS ──────────────────────────────── */

export type ModifierType = 'add' | 'remove';

export interface Modifier {
  id: string;
  name: string;
  type: ModifierType;
}

export type ItemStatus = 'pending' | 'ready';

export interface OrderItem {
  id: string;
  quantity: number;
  name: string;
  status?: ItemStatus;
  modifiers?: Modifier[];
}

export type OrderOrigin = 'Salão' | 'iFood' | 'Balcão' | 'Normal';
export type OrderStatus = 'pending' | 'ready';
export type ViewMode = 'timeline' | 'batch';
export type AppMode = 'cozinha' | 'balcao' | 'salao';

export interface Order {
  id: string;
  displayId: string;
  origin: OrderOrigin;
  createdAt: number;
  items: OrderItem[];
  status: OrderStatus;
  stationId: string;
}

export interface BatchSource {
  orderId: string;
  displayId: string;
  quantity: number;
}

export interface BatchGroup {
  itemName: string;
  totalQty: number;
  sources: BatchSource[];
}

/* ─── Status visual thresholds (minutes) ───────────────────────── */

export interface StatusConfig {
  color: string;
  textColor: string;
  bgClass: string;
  alert: boolean;
}

export function getStatusConfig(waitMinutes: number): StatusConfig {
  if (waitMinutes >= 20) {
    return {
      color: '#DC2626',
      textColor: 'text-red-600',
      bgClass: 'bg-red-600',
      alert: true,
    };
  }
  if (waitMinutes >= 10) {
    return {
      color: '#F59E0B',
      textColor: 'text-amber-500',
      bgClass: 'bg-amber-500',
      alert: false,
    };
  }
  return {
    color: '#10B981',
    textColor: 'text-emerald-500',
    bgClass: 'bg-emerald-500',
    alert: false,
  };
}

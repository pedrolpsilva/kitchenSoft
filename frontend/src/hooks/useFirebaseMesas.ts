'use client';

import { useEffect } from 'react';
import { useSalaoStore } from '@/store/useSalaoStore';
import { useTenantStore } from '@/store/useTenantStore';

export function useFirebaseMesas(): void {
  const tenantId = useTenantStore((s) => s.tenantId);
  const subscribeMesas = useSalaoStore((s) => s.subscribeMesas);

  useEffect(() => {
    if (!tenantId) return;

    const unsubscribe = subscribeMesas(tenantId);
    return () => unsubscribe();
  }, [tenantId, subscribeMesas]);
}

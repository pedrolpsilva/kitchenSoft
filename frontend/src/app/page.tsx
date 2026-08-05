'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { LoginScreen } from '@/components/templates/LoginScreen';
import { KDSBoard } from '@/components/templates/KDSBoard';

/* ─── Entry Point ─── KDS PedroLPS ──────────────────────────────── */

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <KDSBoard />;
}

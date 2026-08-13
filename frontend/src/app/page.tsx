'use client';

import { useEffect, useState } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';
import { LoginScreen } from '@/components/templates/LoginScreen';
import { KDSBoard } from '@/components/templates/KDSBoard';
import { seedInitialUsers } from '@/lib/seedUsers';
import { useRouter } from 'next/navigation';

/* ─── Entry Point ─── KDS PedroLPS ──────────────────────────────── */

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const initAuth = useAuthStore((s) => s._initAuthListener);

  const isProfileLoaded = useTenantStore((s) => s.isProfileLoaded);
  const hasPermission = useTenantStore((s) => s.hasPermission);
  const role = useTenantStore((s) => s.role);

  const router = useRouter();
  const [seeded, setSeeded] = useState(false);

  /* Initialize Firebase Auth listener once */
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  /* Seed initial users once */
  useEffect(() => {
    if (!seeded) {
      seedInitialUsers().then(() => setSeeded(true));
    }
  }, [seeded]);

  /* Redirect operators without cozinha access to their first permitted screen */
  useEffect(() => {
    if (!isAuthenticated || !isProfileLoaded || role === 'admin') return;

    // Operator without cozinha access → redirect to first permitted screen
    if (!hasPermission('tela_cozinha')) {
      if (hasPermission('tela_balcao')) {
        // Stay on same page but KDSBoard will handle appMode
        return;
      }
      if (hasPermission('tela_salao')) {
        router.replace('/salao');
        return;
      }
    }
  }, [isAuthenticated, isProfileLoaded, role, hasPermission, router]);

  /* Loading screen while verifying auth state or loading profile */
  if (isLoading || (isAuthenticated && !isProfileLoaded)) {
    return (
      <main className="flex flex-col items-center justify-center h-screen w-screen bg-black gap-6">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-700">
          <ChefHat size={40} className="text-emerald-500" />
        </div>
        <Loader2 size={32} className="text-emerald-500 animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <KDSBoard />;
}

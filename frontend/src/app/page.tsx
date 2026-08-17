'use client';

import { useEffect } from 'react';
import { ChefHat, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';
import { LoginScreen } from '@/components/templates/LoginScreen';
import { KDSBoard } from '@/components/templates/KDSBoard';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  const isProfileLoaded = useTenantStore((s) => s.isProfileLoaded);
  const hasPermission = useTenantStore((s) => s.hasPermission);
  const role = useTenantStore((s) => s.role);

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !isProfileLoaded || role === 'admin') return;

    if (!hasPermission('tela_cozinha')) {
      if (hasPermission('tela_balcao')) {
        return;
      }
      if (hasPermission('tela_salao')) {
        router.replace('/salao');
        return;
      }
    }
  }, [isAuthenticated, isProfileLoaded, role, hasPermission, router]);

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

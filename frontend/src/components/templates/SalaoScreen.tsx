'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/organisms/TopBar';
import { UserMenuDrawer } from '@/components/organisms/UserMenuDrawer';
import { SalaoBoard } from '@/components/organisms/SalaoBoard';
import { TableDetailsDrawer } from '@/components/organisms/TableDetailsDrawer';
import { ComandaDrawer } from '@/components/organisms/ComandaDrawer';
import { useSalaoStore, Mesa } from '@/store/useSalaoStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';
import { useFirebaseMesas } from '@/hooks/useFirebaseMesas';
import { trackButtonClick, trackUserLoginLocation } from '@/lib/analytics';
import { Pencil, Plus, ChefHat, Loader2 } from 'lucide-react';

export const SalaoScreen: React.FC = () => {
  const router = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { modoEdicao, setModoEdicao, adicionarMesa, mesas } = useSalaoStore();
  const username = useAuthStore((s) => s.username) || 'admin';
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isProfileLoaded = useTenantStore((s) => s.isProfileLoaded);
  const hasPermission = useTenantStore((s) => s.hasPermission);
  const role = useTenantStore((s) => s.role);

  const canEditMesas = hasPermission('editar_mesas');
  const canGerenciarComandas = hasPermission('gerenciar_comandas');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    if (isProfileLoaded && role !== 'admin' && !hasPermission('tela_salao')) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, isProfileLoaded, role, hasPermission, router]);

  useFirebaseMesas();

  useEffect(() => {
    if (isAuthenticated) {
      trackUserLoginLocation(username);
    }
  }, [username, isAuthenticated]);

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
    return null;
  }

  const handleToggleEdicao = () => {
    const nextState = !modoEdicao;
    trackButtonClick(nextState ? 'btn_modo_edicao_ativar' : 'btn_modo_edicao_desativar', 'salao_screen');
    setModoEdicao(nextState);
  };

  const handleAddMesa = () => {
    trackButtonClick('btn_adicionar_mesa', 'salao_screen');
    const offset = (mesas.length * 20) % 200;

    const newMesa: Mesa = {
      id: Math.random().toString(36).substring(7),
      numero: mesas.length + 1,
      formato: 'retangular',
      status: 'livre',
      posicao: { x: 40 + offset, y: 40 + offset },
      tamanho: { largura: 80, altura: 80 },
      cadeiras: 4,
    };
    adicionarMesa(newMesa);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white">
      <TopBar
        stationName="Terminal Salão"
        viewMode="timeline"
        onViewChange={() => { }}
        isOnline={true}
        appMode="salao"
        onAppModeChange={() => { }}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
      />

      <div className="flex flex-1 w-full overflow-hidden">
        <div className="flex-1 relative flex flex-col w-full h-full overflow-hidden min-w-0 transition-all duration-300">
          <div className="h-16 shrink-0 bg-zinc-900 border-b border-zinc-800 flex items-center px-6 gap-4">
            {canEditMesas && (
              <button
                onClick={handleToggleEdicao}
                className={`flex items-center gap-2 px-4 py-2 rounded font-sans font-bold text-sm transition-colors ${modoEdicao
                  ? 'bg-emerald-500 text-black border border-emerald-500'
                  : 'bg-zinc-800 text-gray-50 border border-zinc-700 hover:bg-zinc-700'
                  }`}
              >
                <Pencil size={16} />
                {modoEdicao ? 'Editando' : 'Editar'}
              </button>
            )}

            {modoEdicao && canEditMesas && (
              <button
                onClick={handleAddMesa}
                className="flex items-center gap-2 px-4 py-2 rounded bg-zinc-800 text-gray-50 border border-zinc-700 hover:bg-zinc-700 font-sans font-bold text-sm transition-colors"
              >
                <Plus size={16} />
                Adicionar Mesa
              </button>
            )}
          </div>

          <div className="flex-1 relative flex overflow-hidden">
            <SalaoBoard />
            <TableDetailsDrawer />
            {canGerenciarComandas && <ComandaDrawer />}
          </div>
        </div>

        <UserMenuDrawer
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
        />
      </div>
    </div>
  );
};

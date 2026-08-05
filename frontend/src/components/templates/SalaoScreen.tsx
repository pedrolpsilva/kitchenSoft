'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/organisms/TopBar';
import { UserMenuDrawer } from '@/components/organisms/UserMenuDrawer';
import { SalaoBoard } from '@/components/organisms/SalaoBoard';
import { TableDetailsDrawer } from '@/components/organisms/TableDetailsDrawer';
import { ComandaDrawer } from '@/components/organisms/ComandaDrawer';
import { useSalaoStore, Mesa } from '@/store/useSalaoStore';
import { Pencil, Plus } from 'lucide-react';

export const SalaoScreen: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { modoEdicao, setModoEdicao, adicionarMesa, mesas } = useSalaoStore();

  const handleAddMesa = () => {
    // Deslocamento para evitar sobreposição perfeita (parecendo que nada aconteceu)
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
        onViewChange={() => {}}
        isOnline={true}
        appMode="salao"
        onAppModeChange={() => {}}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
      />

      {/* Main layout container adapting to UserMenuDrawer */}
      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Main View Container */}
        <div className="flex-1 relative flex flex-col w-full h-full overflow-hidden min-w-0 transition-all duration-300">
          
          {/* Action Bar para Salão */}
          <div className="h-16 shrink-0 bg-zinc-900 border-b border-zinc-800 flex items-center px-6 gap-4">
            <button
              onClick={() => setModoEdicao(!modoEdicao)}
              className={`flex items-center gap-2 px-4 py-2 rounded font-sans font-bold text-sm transition-colors ${
                modoEdicao 
                  ? 'bg-emerald-500 text-black border border-emerald-500' 
                  : 'bg-zinc-800 text-gray-50 border border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              <Pencil size={16} />
              Modo Edição {modoEdicao ? 'Ativado' : 'Desativado'}
            </button>

            {modoEdicao && (
              <button
                onClick={handleAddMesa}
                className="flex items-center gap-2 px-4 py-2 rounded bg-zinc-800 text-gray-50 border border-zinc-700 hover:bg-zinc-700 font-sans font-bold text-sm transition-colors"
              >
                <Plus size={16} />
                Adicionar Mesa
              </button>
            )}
          </div>

          {/* Area Principal do Salão */}
          <div className="flex-1 relative flex overflow-hidden">
            <SalaoBoard />
            <TableDetailsDrawer />
            <ComandaDrawer />
          </div>
          
        </div>

        {/* User Menu Drawer (Expands right-to-left) */}
        <UserMenuDrawer
          isOpen={isUserMenuOpen}
          onClose={() => setIsUserMenuOpen(false)}
        />
      </div>
    </div>
  );
};

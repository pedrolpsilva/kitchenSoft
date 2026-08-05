'use client';



import React, { useState, useEffect } from 'react';

import { ArrowLeftRight, User, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StatusDot } from '@/components/atoms/StatusDot';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { useAuthStore } from '@/store/useAuthStore';
import type { ViewMode, AppMode } from '@/types/order';

/* --- TopBar Organism --- Kitchen Soft --------------------------- */

interface TopBarProps {
  stationName: string;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  isOnline: boolean;
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;
  isUserMenuOpen: boolean;
  onToggleUserMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  stationName,
  viewMode,
  onViewChange,
  isOnline,
  appMode,
  onAppModeChange,
  isUserMenuOpen,
  onToggleUserMenu,
}) => {
  const router = useRouter();
  const [clock, setClock] = useState('');
  const username = useAuthStore((s) => s.username) || 'admin';

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1_000);
    return () => clearInterval(interval);
  }, []);

  const toggleAppMode = () => {
    onAppModeChange(appMode === 'cozinha' ? 'balcao' : 'cozinha');
  };

  const appLabel = appMode === 'cozinha' 
    ? 'Kitchen Soft - Cozinha' 
    : appMode === 'balcao' 
      ? 'Kitchen Soft - Balcão' 
      : 'Kitchen Soft - Salão';

  return (
    <header className="flex items-center justify-between h-[8vh] min-h-[86px] px-6 bg-black border-b border-zinc-800 shrink-0 select-none z-20">
      {/* Lado Esquerdo: Branding (Botão de troca) & Contexto */}
      <div className="flex items-center gap-6">
        <button
          onClick={toggleAppMode}
          className="flex items-center gap-3 px-4 py-2 rounded-lg
          bg-zinc-900 border border-zinc-800
          active:scale-[0.97] active:opacity-80
          transition-all duration-100 select-none group"
          aria-label={`Alternar para ${appMode === 'cozinha' ? 'Balcão' : 'Cozinha'}`}
        >
          <ArrowLeftRight
            size={18}
            className="text-emerald-500 transition-colors"
          />
          <span className="font-sans font-bold text-xl text-gray-50 tracking-wide">
            {appLabel}
          </span>
        </button>

        {appMode === 'cozinha' && (
          <SegmentedControl viewMode={viewMode} onViewChange={onViewChange} />
        )}

        {appMode === 'balcao' && (
          <button
            onClick={() => router.push('/salao')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 active:scale-[0.97] transition-all font-sans font-bold text-sm cursor-pointer"
          >
            <LayoutGrid size={18} />
            Ir para Salão
          </button>
        )}

        {appMode === 'salao' && (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-gray-50 border border-zinc-700 hover:bg-zinc-700 active:scale-[0.97] transition-all font-sans font-bold text-sm cursor-pointer"
          >
            <ArrowLeftRight size={18} />
            Voltar ao Balcão
          </button>
        )}
      </div>




 {/* Lado Direito: Relógio + Status + User Button */}

 <div className="flex items-center gap-5">

 <span className="font-mono font-bold text-xl text-gray-50 tabular-nums">

 {clock}

 </span>

 <StatusDot isOnline={isOnline} />



 <div className="h-6 w-px bg-zinc-800" aria-hidden="true" />



 {/* Botão do Usuário */}

 <button

 onClick={onToggleUserMenu}

 className={`

 flex items-center gap-2.5 px-3 py-2 rounded-lg font-sans font-bold text-sm

 border transition-all duration-150 active:scale-[0.97]

 ${

 isUserMenuOpen

 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'

 : 'bg-zinc-900 text-gray-50 border-zinc-800 '

 }

 `}

 title="Menu do Usuário"

 aria-expanded={isUserMenuOpen}

 >

 <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-emerald-400">

 <User size={15} />

 </div>

 <span className="capitalize">{username}</span>

 </button>

 </div>

 </header>

 );

};




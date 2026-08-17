'use client';

import React, { useState, useEffect } from 'react';
import { ChefHat, Store, LayoutGrid, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { StatusDot } from '@/components/atoms/StatusDot';
import { SegmentedControl } from '@/components/molecules/SegmentedControl';
import { useAuthStore } from '@/store/useAuthStore';
import { useTenantStore } from '@/store/useTenantStore';
import { trackButtonClick } from '@/lib/analytics';
import type { ViewMode, AppMode } from '@/types/order';
import type { Permissions } from '@/types/permissions';

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
  viewMode,
  onViewChange,
  isOnline,
  appMode,
  onAppModeChange,
  isUserMenuOpen,
  onToggleUserMenu,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [clock, setClock] = useState('');
  const username = useAuthStore((s) => s.username) || 'admin';
  const hasPermission = useTenantStore((s) => s.hasPermission);
  const role = useTenantStore((s) => s.role);

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

  const handleNavClick = (targetMode: AppMode) => {
    trackButtonClick(`nav_${targetMode}`, 'top_bar_menu', { current_mode: appMode, target_mode: targetMode });
    onAppModeChange(targetMode);
    if (targetMode === 'salao') {
      if (pathname !== '/salao') {
        router.push('/salao');
      }
    } else {
      if (pathname === '/salao') {
        router.push(`/?mode=${targetMode}`);
      }
    }
  };

  const handleUserMenuToggleClick = () => {
    trackButtonClick(isUserMenuOpen ? 'btn_fechar_menu_usuario' : 'btn_abrir_menu_usuario', 'top_bar', { username });
    onToggleUserMenu();
  };

  const modePermissionMap: Record<AppMode, keyof Permissions> = {
    cozinha: 'tela_cozinha',
    balcao: 'tela_balcao',
    salao: 'tela_salao',
  };

  const allNavItems: { mode: AppMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'cozinha', label: 'Cozinha', icon: <ChefHat size={18} /> },
    { mode: 'balcao', label: 'Balcão', icon: <Store size={18} /> },
    { mode: 'salao', label: 'Salão', icon: <LayoutGrid size={18} /> },
  ];

  const navItems = role === 'admin'
    ? allNavItems
    : allNavItems.filter((item) => hasPermission(modePermissionMap[item.mode]));

  return (
    <header className="flex items-center justify-between h-[8vh] min-h-[86px] px-6 bg-black border-b border-zinc-800 shrink-0 select-none z-20 gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ChefHat size={20} />
          </div>
          <span className="font-sans font-extrabold text-xl text-gray-50 tracking-wide">
            Kitchen<span className="text-emerald-500">Soft</span>
          </span>
        </div>

        <div className="h-6 w-px bg-zinc-800 hidden md:block" aria-hidden="true" />

        <nav className="flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl gap-1" aria-label="Menu principal">
          {navItems.map((item) => {
            const isActive = appMode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => handleNavClick(item.mode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-sans font-bold text-sm transition-all duration-150 select-none cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-gray-100 hover:bg-zinc-800/80'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {appMode === 'cozinha' && (
          <SegmentedControl viewMode={viewMode} onViewChange={onViewChange} />
        )}
      </div>

      <div className="flex items-center gap-5">
        <span className="font-mono font-bold text-xl text-gray-50 tabular-nums">
          {clock}
        </span>

        <StatusDot isOnline={isOnline} />

        <div className="h-6 w-px bg-zinc-800" aria-hidden="true" />

        <button
          onClick={handleUserMenuToggleClick}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-lg font-sans font-bold text-sm
            border transition-all duration-150 active:scale-[0.97]
            ${
              isUserMenuOpen
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-zinc-900 text-gray-50 border-zinc-800'
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

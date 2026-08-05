'use client';



import React, { useState } from 'react';

import { User, Settings, LogOut, ShieldCheck, ChevronRight, X } from 'lucide-react';

import { useAuthStore } from '@/store/useAuthStore';

import { ChangeUserDataModal } from '@/components/molecules/ChangeUserDataModal';



/* --- UserMenuDrawer Organism --- Kitchen Soft ------------------- */



interface UserMenuDrawerProps {

 isOpen: boolean;

 onClose: () => void;

}



export const UserMenuDrawer: React.FC<UserMenuDrawerProps> = ({

 isOpen,

 onClose,

}) => {

 const username = useAuthStore((s) => s.username) || 'admin';

 const logout = useAuthStore((s) => s.logout);



 const [isModalOpen, setIsModalOpen] = useState(false);



 const handleLogout = () => {

 onClose();

 logout();

 };



 return (

 <>

 <aside

 className={`

 shrink-0 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full select-none

 transition-all duration-300 ease-in-out overflow-hidden

 ${isOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'}

 `}

 >

 <div className="w-80 flex flex-col h-full">

 {/* Header of Menu */}

 <div className="p-5 border-b border-zinc-800 flex items-center justify-between">

 <div className="flex items-center gap-3">

 <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">

 <User size={20} className="text-emerald-400" />

 </div>

 <div className="flex flex-col">

 <span className="font-sans font-bold text-base text-gray-50 capitalize">

 {username}

 </span>

 <span className="font-sans text-xs text-zinc-400 flex items-center gap-1">

 <ShieldCheck size={12} className="text-emerald-500" />

 Operador KDS

 </span>

 </div>

 </div>



 <button

 onClick={onClose}

 className="p-1.5 rounded-lg text-zinc-400 transition-colors"

 title="Fechar menu"

 >

 <X size={18} />

 </button>

 </div>



 {/* Menu Options */}

 <div className="flex-1 p-4 flex flex-col gap-2">

 <span className="font-sans text-xs text-zinc-500 font-semibold uppercase tracking-wider px-3 py-1">

 Conta & Configurações

 </span>



 {/* Option 1: Alterar Dados */}

 <button

 onClick={() => setIsModalOpen(true)}

 className="w-full flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80

 active:scale-[0.98] transition-all group"

 >

 <div className="flex items-center gap-3">

 <div className="p-2 rounded bg-zinc-800 text-zinc-300 transition-colors">

 <Settings size={18} />

 </div>

 <span className="font-sans font-semibold text-sm text-gray-50">

 Alterar Dados

 </span>

 </div>

 <ChevronRight size={16} className="text-zinc-500 transition-colors" />

 </button>



 {/* Option 2: Sair */}

 <button

 onClick={handleLogout}

 className="w-full flex items-center justify-between p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80

 active:scale-[0.98] transition-all group"

 >

 <div className="flex items-center gap-3">

 <div className="p-2 rounded bg-red-950/40 text-red-400 transition-colors">

 <LogOut size={18} />

 </div>

 <span className="font-sans font-semibold text-sm text-red-400">

 Sair do Sistema

 </span>

 </div>

 <ChevronRight size={16} className="text-zinc-500 transition-colors" />

 </button>

 </div>



 {/* Footer info */}

 <div className="p-4 border-t border-zinc-800/80 text-center">

 <span className="font-sans text-xs text-zinc-600">

 PedroLPS KDS v1.0.0 - Sessão Ativa

 </span>

 </div>

 </div>

 </aside>



 {/* Change Data Modal */}

 <ChangeUserDataModal

 isOpen={isModalOpen}

 onClose={() => setIsModalOpen(false)}

 />

 </>

 );

};




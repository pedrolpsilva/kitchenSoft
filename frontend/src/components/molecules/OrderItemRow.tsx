'use client';



import React from 'react';

import { CheckCircle2, Clock } from 'lucide-react';

import type { OrderItem } from '@/types/order';



/* --- OrderItemRow Molecule --- Kitchen Soft ---------------------- */



interface OrderItemRowProps {

 item: OrderItem;

 onItemClick?: (item: OrderItem) => void;

}



export const OrderItemRow: React.FC<OrderItemRowProps> = ({ item, onItemClick }) => {

 const isReady = item.status === 'ready';



 return (

 <div

 onClick={() => onItemClick?.(item)}

 className={`

 flex flex-col gap-2 p-2.5 rounded-md border transition-all duration-150 select-none cursor-pointer

 ${

 isReady

 ? 'bg-zinc-900/40 border-zinc-800/60 opacity-50 '

 : 'bg-zinc-800/40 border-zinc-700/50 '

 }

 `}

 title={isReady ? 'Clique para alterar status (PRONTO)' : 'Clique para marcar item como PRONTO'}

 >

 {/* Item principal */}

 <div className="flex items-center justify-between gap-2">

 <div className="flex items-start gap-2 min-w-0">

 <span

 className={`font-sans font-bold text-xl shrink-0 ${

 isReady ? 'text-zinc-500 line-through' : 'text-amber-500'

 }`}

 >

 {item.quantity}x

 </span>

 <span

 className={`font-sans text-xl leading-tight ${

 isReady ? 'text-zinc-400 font-normal line-through' : 'text-gray-50 font-normal'

 }`}

 >

 {item.name}

 </span>

 </div>



 {/* Badge / Indicator */}

 {isReady ? (

 <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-sans text-xs font-bold">

 <CheckCircle2 size={12} />

 PRONTO

 </span>

 ) : (

 <span className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-700/60 text-zinc-400 font-sans text-xs font-medium">

 <Clock size={12} />

 PENDENTE

 </span>

 )}

 </div>



 {/* Modificadores / Observações */}

 {item.modifiers && item.modifiers.length > 0 && (

 <ul className="flex flex-col pl-9 gap-1">

 {item.modifiers.map((mod) => (

 <li key={mod.id} className="flex items-center gap-2">

 <span className="w-1.5 h-1.5 bg-zinc-500 rounded-sm shrink-0" />

 <span

 className={`font-sans font-medium text-lg ${

 isReady

 ? 'text-zinc-500 line-through'

 : mod.type === 'remove'

 ? 'text-red-500'

 : 'text-emerald-500'

 }`}

 >

 {mod.type === 'remove' ? '- ' : '+ '}

 {mod.name}

 </span>

 </li>

 ))}

 </ul>

 )}

 </div>

 );

};




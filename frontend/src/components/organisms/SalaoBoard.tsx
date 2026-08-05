'use client';

import React from 'react';
import { useSalaoStore } from '@/store/useSalaoStore';
import { TableNode } from '@/components/molecules/TableNode';

export const SalaoBoard: React.FC = () => {
  const {
    mesas,
    modoEdicao,
    mesaSelecionadaId,
    selecionarMesa,
    atualizarMesa,
    verificarColisao,
  } = useSalaoStore();

  const handleDragStop = (id: string, x: number, y: number) => {
    const mesa = mesas.find((m) => m.id === id);
    if (!mesa) return;

    if (verificarColisao(id, { x, y }, mesa.tamanho)) {
      // Reverter (na prática, não atualizamos a store se houver colisão. O Rnd se ajustará se forçarmos re-render ou nós podemos re-setar a mesa, mas o react-rnd pode precisar de update key ou passarmos a posição antiga, então o ideal é chamar atualizarMesa de volta pra si)
      // Como não atualizamos a store na colisão e passamos a posição por props, o React força a volta para posição anterior
    } else {
      atualizarMesa(id, { posicao: { x, y } });
    }
  };

  const handleResizeStop = (
    id: string,
    largura: number,
    altura: number,
    x: number,
    y: number
  ) => {
    if (verificarColisao(id, { x, y }, { largura, altura })) {
      // Mesma lógica do Drag: não atualiza se tiver colisão
    } else {
      atualizarMesa(id, { tamanho: { largura, altura }, posicao: { x, y } });
    }
  };

  const handleClickBackground = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && modoEdicao) {
      selecionarMesa(null);
    }
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-zinc-950">
      <div 
        className="grid-salao absolute inset-0" 
        onClick={handleClickBackground}
      >
        {mesas.map((mesa) => (
          <TableNode
            key={mesa.id}
            mesa={mesa}
            modoEdicao={modoEdicao}
            selecionada={mesaSelecionadaId === mesa.id}
            onSelect={selecionarMesa}
            onDragStop={handleDragStop}
            onResizeStop={handleResizeStop}
          />
        ))}
      </div>
    </div>
  );
};

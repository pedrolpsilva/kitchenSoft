import React from 'react';
import { Rnd } from 'react-rnd';
import { Mesa, StatusMesa, FormatoMesa } from '@/store/useSalaoStore';
import { trackButtonClick } from '@/lib/analytics';

interface TableNodeProps {
  mesa: Mesa;
  modoEdicao: boolean;
  selecionada: boolean;
  onSelect: (id: string) => void;
  onDragStop: (id: string, x: number, y: number) => void;
  onResizeStop: (id: string, largura: number, altura: number, x: number, y: number) => void;
}

const statusColors: Record<StatusMesa, { bg: string; border: string; text: string }> = {
  livre: { bg: 'bg-emerald-900/30', border: 'border-emerald-500', text: 'text-emerald-500' },
  ocupada: { bg: 'bg-red-900/30', border: 'border-red-500', text: 'text-red-500' },
  limpeza: { bg: 'bg-amber-900/30', border: 'border-amber-500', text: 'text-amber-500' },
  pagamento: { bg: 'bg-blue-900/30', border: 'border-blue-500', text: 'text-blue-500' },
  interditada: { bg: 'bg-zinc-800/80', border: 'border-zinc-600', text: 'text-zinc-500' },
};

export const TableNode: React.FC<TableNodeProps> = ({
  mesa,
  modoEdicao,
  selecionada,
  onSelect,
  onDragStop,
  onResizeStop,
}) => {
  const { bg, border, text } = statusColors[mesa.status];
  const isCircle = mesa.formato === 'circular';

  const handleSelect = () => {
    trackButtonClick(`mesa_${mesa.numero}`, 'salao_floor', {
      mesa_id: mesa.id,
      mesa_numero: mesa.numero,
      status: mesa.status,
      modoEdicao,
    });
    onSelect(mesa.id);
  };

  // Lógica para distribuir cadeiras
  const renderCadeiras = () => {
    const cadeirasArray = Array.from({ length: mesa.cadeiras });
    const cadeiraSize = 12; // px

    if (isCircle) {
      const radius = mesa.tamanho.largura / 2 + 10;
      return cadeirasArray.map((_, i) => {
        const angle = (i * 360) / mesa.cadeiras;
        return (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full bg-zinc-600 border ${border}`}
            style={{
              top: '50%',
              left: '50%',
              marginTop: -cadeiraSize / 2,
              marginLeft: -cadeiraSize / 2,
              transform: `rotate(${angle}deg) translateY(-${radius}px)`,
            }}
          />
        );
      });
    }

    return cadeirasArray.map((_, i) => {
      const topOrBottom = i % 2 === 0 ? 'top' : 'bottom';
      const offset = -14;
      const pos = ((Math.floor(i / 2) + 1) / (Math.ceil(mesa.cadeiras / 2) + 1)) * 100;
      
      return (
        <div
          key={i}
          className={`absolute w-3 h-3 bg-zinc-600 border ${border} ${
            isCircle ? 'rounded-full' : 'rounded-sm'
          }`}
          style={{
            [topOrBottom]: `${offset}px`,
            left: `${pos}%`,
            transform: 'translateX(-50%)',
          }}
        />
      );
    });
  };

  return (
    <Rnd
      bounds="parent"
      dragGrid={[20, 20]}
      resizeGrid={[20, 20]}
      size={{ width: mesa.tamanho.largura, height: mesa.tamanho.altura }}
      position={{ x: mesa.posicao.x, y: mesa.posicao.y }}
      onDragStop={(e, d) => onDragStop(mesa.id, d.x, d.y)}
      onResizeStop={(e, direction, ref, delta, position) => {
        onResizeStop(
          mesa.id,
          parseInt(ref.style.width, 10),
          parseInt(ref.style.height, 10),
          position.x,
          position.y
        );
      }}
      disableDragging={!modoEdicao}
      enableResizing={
        modoEdicao
          ? {
              top: true, right: true, bottom: true, left: true,
              topRight: true, bottomRight: true, bottomLeft: true, topLeft: true,
            }
          : false
      }
      onClick={handleSelect}
      className={`absolute flex items-center justify-center cursor-pointer transition-colors duration-200 ${
        selecionada ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 z-50' : 'z-10'
      } ${modoEdicao ? 'hover:ring-1 hover:ring-zinc-400' : ''}`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {renderCadeiras()}
        <div
          className={`w-full h-full flex flex-col items-center justify-center border-2 shadow-lg backdrop-blur-md ${bg} ${border} ${
            isCircle ? 'rounded-full' : 'rounded-lg'
          }`}
        >
          <span className={`text-xl font-bold font-mono ${text}`}>
            {mesa.numero}
          </span>
        </div>
      </div>
    </Rnd>
  );
};


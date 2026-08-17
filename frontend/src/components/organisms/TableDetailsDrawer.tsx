'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSalaoStore, StatusMesa, Mesa } from '@/store/useSalaoStore';
import { ButtonKDS } from '@/components/atoms/ButtonKDS';
import { trackButtonClick } from '@/lib/analytics';

export const TableDetailsDrawer: React.FC = () => {
  const {
    mesas,
    mesaSelecionadaId,
    modoEdicao,
    selecionarMesa,
    atualizarMesa,
    removerMesa,
  } = useSalaoStore();

  const isOpen = modoEdicao && mesaSelecionadaId !== null;
  const mesa = mesas.find((m) => m.id === mesaSelecionadaId);

  const [formData, setFormData] = useState<Partial<Mesa>>({});

  useEffect(() => {
    if (mesa) {
      setFormData(mesa);
    }
  }, [mesa]);

  if (!isOpen || !mesa) {
    return (
      <aside
        className={`shrink-0 h-full bg-zinc-950 border-zinc-800 transition-all duration-300 ease-in-out w-0 opacity-0 border-l-0 overflow-hidden`}
      />
    );
  }

  const handleChange = (field: keyof Mesa, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    trackButtonClick('btn_salvar_mesa', 'table_details_drawer', { mesa_id: mesaSelecionadaId });
    if (mesaSelecionadaId) {
      atualizarMesa(mesaSelecionadaId, formData);
    }
  };

  const handleDelete = () => {
    trackButtonClick('btn_excluir_mesa', 'table_details_drawer', { mesa_id: mesaSelecionadaId });
    if (mesaSelecionadaId) {
      removerMesa(mesaSelecionadaId);
    }
  };

  const handleClose = () => {
    trackButtonClick('btn_fechar_detalhes_mesa', 'table_details_drawer');
    selecionarMesa(null);
  };

  const statusOptions: { value: StatusMesa; label: string }[] = [
    { value: 'livre', label: 'Livre' },
    { value: 'ocupada', label: 'Ocupada' },
    { value: 'limpeza', label: 'Limpeza' },
    { value: 'pagamento', label: 'Pagamento' },
    { value: 'interditada', label: 'Interditada' },
  ];

  return (
    <aside
      className={`shrink-0 h-full bg-zinc-950 border-l border-zinc-800 flex flex-col
      transition-all duration-300 ease-in-out
      w-80 opacity-100 shadow-2xl overflow-hidden`}
    >
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <h2 className="font-sans font-bold text-lg text-gray-50">
          Editar Mesa {mesa.numero}
        </h2>
        <button
          onClick={handleClose}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto overflow-x-hidden custom-scrollbar">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Número da Mesa</label>
          <input
            type="number"
            value={formData.numero || ''}
            onChange={(e) => handleChange('numero', parseInt(e.target.value, 10))}
            className="bg-zinc-900 border border-zinc-800 rounded p-3 text-white text-lg font-mono outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Formato</label>
          <div className="flex bg-zinc-800 p-1 rounded-lg w-full">
            <button
              onClick={() => {
                trackButtonClick('btn_formato_retangular', 'table_details_drawer');
                handleChange('formato', 'retangular');
              }}
              className={`flex-1 min-w-0 h-10 rounded-md font-sans font-bold text-sm transition-colors ${
                formData.formato === 'retangular' ? 'bg-gray-50 text-black' : 'text-zinc-400'
              }`}
            >
              Retangular
            </button>
            <button
              onClick={() => {
                trackButtonClick('btn_formato_circular', 'table_details_drawer');
                handleChange('formato', 'circular');
              }}
              className={`flex-1 min-w-0 h-10 rounded-md font-sans font-bold text-sm transition-colors ${
                formData.formato === 'circular' ? 'bg-gray-50 text-black' : 'text-zinc-400'
              }`}
            >
              Circular
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Quantidade de Cadeiras</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                trackButtonClick('btn_diminuir_cadeiras', 'table_details_drawer');
                handleChange('cadeiras', Math.max(1, (formData.cadeiras || 1) - 1));
              }}
              className="shrink-0 w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-xl font-bold text-white active:scale-95"
            >
              -
            </button>
            <input
              type="number"
              value={formData.cadeiras || 0}
              readOnly
              className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded h-12 text-center text-white text-lg font-mono outline-none"
            />
            <button
              onClick={() => {
                trackButtonClick('btn_aumentar_cadeiras', 'table_details_drawer');
                handleChange('cadeiras', (formData.cadeiras || 0) + 1);
              }}
              className="shrink-0 w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-xl font-bold text-white active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-400">Status Atual</label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value as StatusMesa)}
            className="bg-zinc-900 border border-zinc-800 rounded p-3 text-white text-base outline-none focus:border-emerald-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="p-5 border-t border-zinc-800 flex flex-col gap-3">
        <ButtonKDS label="Salvar Alterações" onClick={handleSave} variant="primary" />
        <ButtonKDS label="Excluir Mesa" onClick={handleDelete} variant="danger" />
      </div>
    </aside>
  );
};

'use client';

import React, { useState, useCallback } from 'react';
import { ChefHat, Plus, Trash2, Send, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { trackButtonClick } from '@/lib/analytics';
import { useTenantStore } from '@/store/useTenantStore';

/* ─── Types ─── */

interface ModifierForm {
  tempId: string;
  name: string;
  type: 'add' | 'remove';
}

interface OrderItemForm {
  tempId: string;
  name: string;
  quantity: number;
  modifiers: ModifierForm[];
}

type OrderOrigin = 'Salão' | 'iFood' | 'Balcão';
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

/* ─── Constants ─── */

const BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL ?? 'http://localhost:8585';

const ORIGINS: OrderOrigin[] = ['Salão', 'iFood', 'Balcão'];

const STATIONS = [
  { id: 'chapa-grelha', label: 'Chapa / Grelha' },
  { id: 'fritadeira', label: 'Fritadeira' },
  { id: 'montagem', label: 'Montagem' },
  { id: 'bebidas', label: 'Bebidas' },
];

/* ─── Helpers ─── */

let counter = 0;
function tempId(): string {
  return `tmp_${Date.now()}_${++counter}`;
}

function createEmptyItem(): OrderItemForm {
  return {
    tempId: tempId(),
    name: '',
    quantity: 1,
    modifiers: [],
  };
}

function createEmptyModifier(): ModifierForm {
  return {
    tempId: tempId(),
    name: '',
    type: 'add',
  };
}

/* ─── Admin Page ─── KDS PedroLPS ───────────────────────────────── */

export default function AdminPage() {
  const [displayId, setDisplayId] = useState('');
  const [origin, setOrigin] = useState<OrderOrigin>('Salão');
  const [stationId, setStationId] = useState('chapa-grelha');
  const [items, setItems] = useState<OrderItemForm[]>([createEmptyItem()]);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const tenantId = useTenantStore((s) => s.tenantId);

  /* ── Item Management ── */

  const addItem = useCallback(() => {
    trackButtonClick('btn_adicionar_item_admin', 'admin_page');
    setItems((prev) => [...prev, createEmptyItem()]);
  }, []);

  const removeItem = useCallback((tempId: string) => {
    trackButtonClick('btn_remover_item_admin', 'admin_page');
    setItems((prev) => prev.filter((item) => item.tempId !== tempId));
  }, []);

  const updateItem = useCallback(
    (tempId: string, field: keyof OrderItemForm, value: string | number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.tempId === tempId ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  /* ── Modifier Management ── */

  const addModifier = useCallback((itemTempId: string) => {
    trackButtonClick('btn_adicionar_modificador_admin', 'admin_page');
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === itemTempId
          ? { ...item, modifiers: [...item.modifiers, createEmptyModifier()] }
          : item
      )
    );
  }, []);

  const removeModifier = useCallback(
    (itemTempId: string, modTempId: string) => {
      trackButtonClick('btn_remover_modificador_admin', 'admin_page');
      setItems((prev) =>
        prev.map((item) =>
          item.tempId === itemTempId
            ? {
                ...item,
                modifiers: item.modifiers.filter((m) => m.tempId !== modTempId),
              }
            : item
        )
      );
    },
    []
  );

  const updateModifier = useCallback(
    (
      itemTempId: string,
      modTempId: string,
      field: keyof ModifierForm,
      value: string
    ) => {
      setItems((prev) =>
        prev.map((item) =>
          item.tempId === itemTempId
            ? {
                ...item,
                modifiers: item.modifiers.map((m) =>
                  m.tempId === modTempId ? { ...m, [field]: value } : m
                ),
              }
            : item
        )
      );
    },
    []
  );

  /* ── Submit ── */

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      trackButtonClick('btn_enviar_pedido_admin', 'admin_page', { displayId, origin, stationId });
      setStatus('loading');
      setErrorMsg('');

      // Validate
      const validItems = items.filter((item) => item.name.trim() !== '');
      if (!displayId.trim()) {
        setStatus('error');
        setErrorMsg('Informe o ID de exibição (ex: #042, MESA 12).');
        return;
      }
      if (validItems.length === 0) {
        setStatus('error');
        setErrorMsg('Adicione pelo menos um item com nome.');
        return;
      }

      // Build payload matching Go backend expectations
      const payload = {
        tenantId,
        displayId: displayId.trim(),
        origin,
        stationId,
        items: validItems.map((item, idx) => ({
          id: `item_${idx + 1}`,
          name: item.name.trim(),
          quantity: Math.max(1, item.quantity),
          modifiers: item.modifiers
            .filter((m) => m.name.trim() !== '')
            .map((m, mIdx) => ({
              id: `mod_${idx + 1}_${mIdx + 1}`,
              name: m.name.trim(),
              type: m.type,
            })),
        })),
      };

      try {
        const response = await fetch(`${BACKEND_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || `HTTP ${response.status}`);
        }

        setStatus('success');
        setSuccessCount((prev) => prev + 1);

        // Reset form for next order
        setTimeout(() => {
          setDisplayId('');
          setItems([createEmptyItem()]);
          setStatus('idle');
        }, 1500);
      } catch (err) {
        setStatus('error');
        setErrorMsg(
          err instanceof Error ? err.message : 'Erro desconhecido ao enviar pedido.'
        );
      }
    },
    [displayId, origin, stationId, items, tenantId]
  );

  return (
    <main className="admin-page flex items-start justify-center min-h-screen w-screen bg-black overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl flex flex-col gap-8">

        {/* ── Header ── */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700
                         text-zinc-400 hover:text-gray-50 hover:border-zinc-600 transition-colors"
              aria-label="Voltar ao KDS"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-700">
                <ChefHat size={24} className="text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-xl text-gray-50 tracking-wide">
                  PedroLPS Admin
                </span>
                <span className="font-sans text-xs text-zinc-400">
                  Inserir pedidos na fila
                </span>
              </div>
            </div>
          </div>

          {successCount > 0 && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
              <CheckCircle size={14} className="text-emerald-500" />
              <span className="font-sans text-sm font-medium text-emerald-400">
                {successCount} pedido{successCount > 1 ? 's' : ''} enviado{successCount > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </header>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Row 1: Display ID + Origin + Station ── */}
          <div className="grid grid-cols-3 gap-4">
            {/* Display ID */}
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-displayId" className="font-sans text-sm font-medium text-zinc-400">
                ID Exibição
              </label>
              <input
                id="admin-displayId"
                type="text"
                value={displayId}
                onChange={(e) => setDisplayId(e.target.value)}
                placeholder="#042"
                className="h-14 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                           font-sans text-lg font-bold text-gray-50 placeholder-zinc-600
                           outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                           transition-colors"
              />
            </div>

            {/* Origin */}
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-origin" className="font-sans text-sm font-medium text-zinc-400">
                Origem
              </label>
              <select
                id="admin-origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value as OrderOrigin)}
                className="h-14 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                           font-sans text-base text-gray-50
                           outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                           transition-colors appearance-none cursor-pointer"
              >
                {ORIGINS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Station */}
            <div className="flex flex-col gap-2">
              <label htmlFor="admin-station" className="font-sans text-sm font-medium text-zinc-400">
                Estação
              </label>
              <select
                id="admin-station"
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="h-14 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                           font-sans text-base text-gray-50
                           outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                           transition-colors appearance-none cursor-pointer"
              >
                {STATIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Items Section ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-sans font-bold text-lg text-gray-50">
                Itens do Pedido
              </h2>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md
                           font-sans text-sm font-medium text-emerald-400
                           hover:bg-zinc-700 hover:border-zinc-600 transition-colors select-none"
              >
                <Plus size={16} />
                Adicionar Item
              </button>
            </div>

            {items.map((item, itemIndex) => (
              <div
                key={item.tempId}
                className="flex flex-col gap-3 p-5 bg-zinc-800 border border-zinc-700 rounded-md
                           shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                {/* Item Header */}
                <div className="flex items-center gap-3">
                  <span className="font-sans font-bold text-sm text-zinc-500 shrink-0">
                    #{itemIndex + 1}
                  </span>

                  {/* Quantity */}
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.tempId, 'quantity', parseInt(e.target.value) || 1)
                    }
                    className="w-20 h-12 px-3 bg-zinc-900 border border-zinc-700 rounded-md
                               font-sans text-xl font-bold text-amber-500 text-center
                               outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500
                               transition-colors"
                    aria-label={`Quantidade item ${itemIndex + 1}`}
                  />

                  {/* Name */}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(item.tempId, 'name', e.target.value)}
                    placeholder="Nome do item (ex: Hambúrguer Clássico)"
                    className="flex-1 h-12 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                               font-sans text-base text-gray-50 placeholder-zinc-600
                               outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                               transition-colors"
                    aria-label={`Nome item ${itemIndex + 1}`}
                  />

                  {/* Remove Item */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.tempId)}
                      className="flex items-center justify-center w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-md
                                 text-red-500 hover:bg-red-950/40 hover:border-red-800 transition-colors"
                      aria-label={`Remover item ${itemIndex + 1}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Modifiers */}
                {item.modifiers.length > 0 && (
                  <div className="flex flex-col gap-2 pl-8 border-l-2 border-zinc-700 ml-4">
                    {item.modifiers.map((mod) => (
                      <div key={mod.tempId} className="flex items-center gap-2">
                        {/* Type toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            updateModifier(
                              item.tempId,
                              mod.tempId,
                              'type',
                              mod.type === 'add' ? 'remove' : 'add'
                            )
                          }
                          className={`shrink-0 w-8 h-8 rounded flex items-center justify-center font-sans font-bold text-sm
                            transition-colors select-none ${
                              mod.type === 'add'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          aria-label={`Tipo: ${mod.type === 'add' ? 'Adicionar' : 'Remover'}`}
                        >
                          {mod.type === 'add' ? '+' : '−'}
                        </button>

                        {/* Modifier Name */}
                        <input
                          type="text"
                          value={mod.name}
                          onChange={(e) =>
                            updateModifier(item.tempId, mod.tempId, 'name', e.target.value)
                          }
                          placeholder="Ex: Sem Cebola, Extra Bacon"
                          className="flex-1 h-8 px-3 bg-zinc-900 border border-zinc-700 rounded
                                     font-sans text-sm text-gray-50 placeholder-zinc-600
                                     outline-none focus:border-zinc-500 transition-colors"
                        />

                        {/* Remove Modifier */}
                        <button
                          type="button"
                          onClick={() => removeModifier(item.tempId, mod.tempId)}
                          className="shrink-0 w-8 h-8 rounded flex items-center justify-center
                                     text-zinc-500 hover:text-red-400 transition-colors"
                          aria-label="Remover modificador"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Modifier Button */}
                <button
                  type="button"
                  onClick={() => addModifier(item.tempId)}
                  className="flex items-center gap-1.5 ml-8 mt-1
                             font-sans text-xs font-medium text-zinc-500 hover:text-zinc-300
                             transition-colors select-none"
                >
                  <Plus size={12} />
                  Modificador
                </button>
              </div>
            ))}
          </div>

          {/* ── Error / Success Messages ── */}
          {status === 'error' && errorMsg && (
            <div className="flex items-center gap-3 px-4 py-3 bg-red-950/40 border border-red-800 rounded-md">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span className="font-sans text-sm text-red-400">{errorMsg}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-950/40 border border-emerald-800 rounded-md">
              <CheckCircle size={18} className="text-emerald-500 shrink-0" />
              <span className="font-sans text-sm text-emerald-400">
                Pedido enviado com sucesso! A fila foi atualizada.
              </span>
            </div>
          )}

          {/* ── Submit Button ── */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full h-16 bg-emerald-500 rounded-md
                       font-sans font-bold text-lg text-black
                       select-none transition-all duration-75
                       active:scale-[0.97] active:opacity-80
                       hover:bg-emerald-400
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                       flex items-center justify-center gap-3"
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={20} />
                ENVIAR PEDIDO PARA A FILA
              </>
            )}
          </button>
        </form>

        {/* ── Footer ── */}
        <footer className="text-center pb-8">
          <p className="font-sans text-xs text-zinc-600">
            Os pedidos serão enviados ao backend Go (:{BACKEND_URL.split(':').pop()}) e gravados no Firebase Realtime Database.
          </p>
        </footer>
      </div>
    </main>
  );
}

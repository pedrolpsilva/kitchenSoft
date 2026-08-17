'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Send, CheckCircle, AlertCircle, Search, ChevronsRight, ChevronsLeft, BookOpen } from 'lucide-react';
import { PRODUCT_CATALOG, searchCatalog } from '@/lib/productCatalog';
import { useOrderStore } from '@/store/useOrderStore';
import { useTenantStore } from '@/store/useTenantStore';
import { createOrderInFirebase } from '@/lib/firebaseOrderItems';

interface ModifierForm {
  tempId: string;
  name: string;
}

interface OrderItemForm {
  tempId: string;
  name: string;
  quantity: number;
  modifiers: ModifierForm[];
}

type BalcaoOrigin = 'Normal' | 'iFood';
type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';
type SortMode = 'name-asc' | 'name-desc' | 'orders-asc' | 'orders-desc';

const BACKEND_URL = process.env.NEXT_PUBLIC_GO_BACKEND_URL ?? 'http://localhost:8585';
const DEFAULT_STATION_ID = 'chapa-grelha';
const COUNTER_KEY_N = 'kds_counter_N';
const COUNTER_KEY_E = 'kds_counter_E';

let tempCounter = 0;
function tempId(): string {
  return `tmp_${Date.now()}_${++tempCounter}`;
}

function createEmptyItem(): OrderItemForm {
  return { tempId: tempId(), name: '', quantity: 1, modifiers: [] };
}

function createEmptyModifier(): ModifierForm {
  return { tempId: tempId(), name: '' };
}

function readCounter(key: string): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : 0;
}

function writeCounter(key: string, value: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, String(value));
  }
}

function generateDisplayId(origin: BalcaoOrigin): string {
  const prefix = origin === 'iFood' ? 'E' : 'N';
  const key = origin === 'iFood' ? COUNTER_KEY_E : COUNTER_KEY_N;
  const next = readCounter(key) + 1;
  return `${prefix}${String(next).padStart(3, '0')}`;
}

function commitCounter(origin: BalcaoOrigin): void {
  const key = origin === 'iFood' ? COUNTER_KEY_E : COUNTER_KEY_N;
  const next = readCounter(key) + 1;
  writeCounter(key, next);
}

function useAutocomplete() {
  const [activeIndex, setActiveIndex] = useState<string | null>(null);
  const [query, setQuery] = useState<Record<string, string>>({});

  const getSuggestions = useCallback((itemTempId: string): ReturnType<typeof searchCatalog> => {
    const q = query[itemTempId];
    if (!q || q.length < 1) return [];
    return searchCatalog(q).slice(0, 8);
  }, [query]);

  return { activeIndex, setActiveIndex, query, setQuery, getSuggestions };
}

interface ProductSidebarProps {
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  onAddProduct: (productName: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const ProductSidebar: React.FC<ProductSidebarProps> = ({
  sortMode,
  onSortChange,
  onAddProduct,
  isCollapsed,
  onToggleCollapse,
}) => {
  const orders = useOrderStore((s) => s.orders);
  const [filterText, setFilterText] = useState('');

  const orderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.name.toLowerCase().trim();
        counts.set(key, (counts.get(key) ?? 0) + item.quantity);
      }
    }
    return counts;
  }, [orders]);

  const sortedProducts = useMemo(() => {
    let list = [...PRODUCT_CATALOG];

    if (filterText.trim()) {
      const q = filterText.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }

    switch (sortMode) {
      case 'name-asc':
        list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        break;
      case 'name-desc':
        list.sort((a, b) => b.name.localeCompare(a.name, 'pt-BR'));
        break;
      case 'orders-asc':
        list.sort(
          (a, b) =>
            (orderCounts.get(a.name.toLowerCase().trim()) ?? 0) -
            (orderCounts.get(b.name.toLowerCase().trim()) ?? 0)
        );
        break;
      case 'orders-desc':
        list.sort(
          (a, b) =>
            (orderCounts.get(b.name.toLowerCase().trim()) ?? 0) -
            (orderCounts.get(a.name.toLowerCase().trim()) ?? 0)
        );
        break;
    }

    return list;
  }, [sortMode, filterText, orderCounts]);

  const sortOptions: { key: SortMode; label: string }[] = [
    { key: 'name-asc', label: 'Nome A-Z' },
    { key: 'name-desc', label: 'Nome Z-A' },
    { key: 'orders-desc', label: 'Pedidos Mais->Menos' },
    { key: 'orders-asc', label: 'Pedidos Menos->Mais' },
  ];

  if (isCollapsed) {
    return (
      <aside className="w-14 shrink-0 border-l border-zinc-800 flex flex-col items-center py-4 gap-4 bg-zinc-950 select-none">
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expandir Cardápio"
          className="p-2 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 transition-colors"
        >
          <ChevronsLeft size={20} />
        </button>
        <div className="flex flex-col items-center gap-2 text-zinc-500">
          <BookOpen size={18} />
          <span className="font-sans text-xs font-semibold [writing-mode:vertical-lr] rotate-180 tracking-widest uppercase">
            Cardápio
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[340px] shrink-0 border-l border-zinc-800 flex flex-col h-full bg-zinc-950 select-none">
      <div className="p-4 border-b border-zinc-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sans font-bold text-base text-gray-50 flex items-center gap-2">
            <BookOpen size={18} className="text-emerald-500" />
            Cardápio
          </h3>

          <button
            type="button"
            onClick={onToggleCollapse}
            title="Contrair Cardápio"
            className="p-1.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 transition-colors"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Buscar produto..."
            className="w-full h-9 pl-8 pr-3 bg-zinc-900 border border-zinc-700 rounded
            font-sans text-sm text-gray-50 placeholder-zinc-600
            outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onSortChange(opt.key)}
              className={`px-2.5 py-1 rounded font-sans text-xs font-medium transition-colors select-none
              ${
                sortMode === opt.key
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedProducts.map((product) => {
          const count = orderCounts.get(product.name.toLowerCase().trim()) ?? 0;
          return (
            <div
              key={product.id}
              onDoubleClick={() => onAddProduct(product.name)}
              title="Clique duplo para adicionar ao pedido"
              className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/50
              transition-colors cursor-pointer active:scale-[0.99]"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-sans text-sm font-medium text-gray-50 truncate">
                  {product.name}
                </span>
                <span className="font-sans text-xs text-zinc-500">
                  {product.category}
                </span>
              </div>
              {count > 0 && (
                <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30
                font-mono text-xs font-bold text-amber-400">
                  {count}
                </span>
              )}
            </div>
          );
        })}

        {sortedProducts.length === 0 && (
          <div className="flex items-center justify-center h-24">
            <span className="font-sans text-sm text-zinc-500">Nenhum produto encontrado</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export const BalcaoForm: React.FC = () => {
  const [origin, setOrigin] = useState<BalcaoOrigin>('Normal');
  const [displayId, setDisplayId] = useState('');
  const [items, setItems] = useState<OrderItemForm[]>([createEmptyItem()]);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [sortMode, setSortMode] = useState<SortMode>('name-asc');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const tenantId = useTenantStore((s) => s.tenantId);
  const autocomplete = useAutocomplete();

  useEffect(() => {
    setDisplayId(generateDisplayId(origin));
  }, [origin]);

  const addItem = useCallback(() => {
    setItems((prev) => {
      const hasEmpty = prev.some((item) => item.name.trim() === '');
      if (hasEmpty) {
        setErrorMsg('Preencha o nome do item atual antes de adicionar outro.');
        return prev;
      }
      setErrorMsg('');
      return [...prev, createEmptyItem()];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.tempId !== id));
  }, []);

  const updateItemName = useCallback(
    (id: string, value: string) => {
      setItems((prev) =>
        prev.map((item) => (item.tempId === id ? { ...item, name: value } : item))
      );
      autocomplete.setQuery((prev) => ({ ...prev, [id]: value }));
      autocomplete.setActiveIndex(id);
      setErrorMsg('');
    },
    [autocomplete]
  );

  const updateItemQuantity = useCallback((id: string, value: number) => {
    setItems((prev) =>
      prev.map((item) => (item.tempId === id ? { ...item, quantity: value } : item))
    );
  }, []);

  const selectSuggestion = useCallback(
    (itemTempId: string, productName: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.tempId === itemTempId ? { ...item, name: productName } : item
        )
      );
      autocomplete.setActiveIndex(null);
      autocomplete.setQuery((prev) => ({ ...prev, [itemTempId]: '' }));
      setErrorMsg('');
    },
    [autocomplete]
  );

  const handleAddProductFromCatalog = useCallback((productName: string) => {
    setErrorMsg('');
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.name.trim().toLowerCase() === productName.trim().toLowerCase()
      );

      if (existingIndex >= 0) {
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      const emptyIndex = prev.findIndex((item) => item.name.trim() === '');
      if (emptyIndex >= 0) {
        return prev.map((item, idx) =>
          idx === emptyIndex ? { ...item, name: productName } : item
        );
      }

      return [...prev, { tempId: tempId(), name: productName, quantity: 1, modifiers: [] }];
    });
  }, []);

  const addModifier = useCallback((itemTempId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === itemTempId
          ? { ...item, modifiers: [...item.modifiers, createEmptyModifier()] }
          : item
      )
    );
  }, []);

  const removeModifier = useCallback((itemTempId: string, modTempId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === itemTempId
          ? { ...item, modifiers: item.modifiers.filter((m) => m.tempId !== modTempId) }
          : item
      )
    );
  }, []);

  const updateModifier = useCallback(
    (itemTempId: string, modTempId: string, value: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.tempId === itemTempId
            ? {
                ...item,
                modifiers: item.modifiers.map((m) =>
                  m.tempId === modTempId ? { ...m, name: value } : m
                ),
              }
            : item
        )
      );
    },
    []
  );

  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        autocomplete.setActiveIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [autocomplete]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus('loading');
      setErrorMsg('');

      const validItems = items.filter((item) => item.name.trim() !== '');
      if (validItems.length === 0) {
        setStatus('error');
        setErrorMsg('Adicione pelo menos um item com nome.');
        return;
      }

      if (items.some((item) => item.name.trim() === '')) {
        setStatus('error');
        setErrorMsg('Existem itens com nome em branco no pedido. Preencha ou remova-os.');
        return;
      }

      const formattedItems = validItems.map((item, idx) => ({
        id: `item_${idx + 1}`,
        name: item.name.trim(),
        quantity: Math.max(1, item.quantity),
        modifiers: item.modifiers
          .filter((m) => m.name.trim() !== '')
          .map((m, mIdx) => ({
            id: `obs_${idx + 1}_${mIdx + 1}`,
            name: m.name.trim(),
            type: 'add' as const,
          })),
      }));

      const payload = {
        tenantId,
        displayId,
        origin,
        stationId: DEFAULT_STATION_ID,
        items: formattedItems,
      };

      try {
        let sent = false;

        try {
          const response = await fetch(`${BACKEND_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (response.ok) {
            sent = true;
          }
        } catch {
        }

        if (!sent) {
          await createOrderInFirebase(DEFAULT_STATION_ID, {
            displayId,
            origin,
            items: formattedItems,
            tenantId: tenantId || undefined,
          });
        }

        commitCounter(origin);
        setStatus('success');
        setSuccessCount((prev) => prev + 1);

        setTimeout(() => {
          setItems([createEmptyItem()]);
          setDisplayId(generateDisplayId(origin));
          setStatus('idle');
        }, 1200);
      } catch (err) {
        setStatus('error');
        setErrorMsg(
          err instanceof Error ? err.message : 'Erro desconhecido ao enviar pedido.'
        );
      }
    },
    [displayId, origin, items, tenantId]
  );

  return (
    <div className="flex flex-1 h-full overflow-hidden">
      <section className="flex-1 overflow-y-auto custom-scrollbar" ref={formRef}>
        <div className="max-w-xl mx-auto py-8 px-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-bold text-xl text-gray-50">Registrar Pedido</h2>
            {successCount > 0 && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <CheckCircle size={14} className="text-emerald-500" />
                <span className="font-sans text-sm font-medium text-emerald-400">
                  {successCount} enviado{successCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-medium text-zinc-400">
                  ID Exibição
                </label>
                <div
                  className="h-14 px-4 flex items-center bg-zinc-900/60 border border-zinc-700/50 rounded-md
                  font-sans text-2xl font-black text-gray-50 tracking-wider select-none"
                >
                  {displayId}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-sm font-medium text-zinc-400">
                  Origem
                </label>
                <div className="flex bg-zinc-800 p-1 rounded-lg h-14">
                  <button
                    type="button"
                    onClick={() => setOrigin('Normal')}
                    className={`flex-1 rounded-md font-sans font-bold text-base transition-colors select-none
                    ${origin === 'Normal' ? 'bg-gray-50 text-black' : 'text-zinc-400 bg-transparent'}`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrigin('iFood')}
                    className={`flex-1 rounded-md font-sans font-bold text-base transition-colors select-none
                    ${origin === 'iFood' ? 'bg-red-600 text-white' : 'text-zinc-400 bg-transparent'}`}
                  >
                    iFood
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans font-bold text-base text-gray-50">Itens do Pedido</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md
                  font-sans text-sm font-medium text-emerald-400 transition-colors select-none"
                >
                  <Plus size={16} />
                  Adicionar Item
                </button>
              </div>

              {items.map((item, itemIndex) => {
                const suggestions = autocomplete.activeIndex === item.tempId
                  ? autocomplete.getSuggestions(item.tempId)
                  : [];

                return (
                  <div
                    key={item.tempId}
                    className="flex flex-col gap-3 p-5 bg-zinc-800 border border-zinc-700 rounded-md shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-sans font-bold text-sm text-zinc-500 shrink-0">
                        #{itemIndex + 1}
                      </span>

                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemQuantity(item.tempId, parseInt(e.target.value) || 1)
                        }
                        className="w-20 h-12 px-3 bg-zinc-900 border border-zinc-700 rounded-md
                        font-sans text-xl font-bold text-amber-500 text-center
                        outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                        aria-label={`Quantidade item ${itemIndex + 1}`}
                      />

                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateItemName(item.tempId, e.target.value)}
                          onFocus={() => {
                            autocomplete.setActiveIndex(item.tempId);
                            autocomplete.setQuery((prev) => ({ ...prev, [item.tempId]: item.name }));
                          }}
                          placeholder="Digite o nome do item..."
                          className="w-full h-12 px-4 bg-zinc-900 border border-zinc-700 rounded-md
                          font-sans text-base text-gray-50 placeholder-zinc-600
                          outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                          aria-label={`Nome item ${itemIndex + 1}`}
                          autoComplete="off"
                        />

                        {suggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30
                          bg-zinc-900 border border-zinc-700 rounded-md shadow-xl
                          max-h-56 overflow-y-auto custom-scrollbar">
                            {suggestions.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => selectSuggestion(item.tempId, product.name)}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                              >
                                <span className="font-sans text-sm text-gray-50">{product.name}</span>
                                <span className="font-sans text-xs text-zinc-500 shrink-0 ml-2">
                                  {product.category}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.tempId)}
                          className="flex items-center justify-center w-12 h-12 bg-zinc-900 border border-zinc-700 rounded-md
                          text-red-500 transition-colors"
                          aria-label={`Remover item ${itemIndex + 1}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    {item.modifiers.length > 0 && (
                      <div className="flex flex-col gap-2 pl-8 border-l-2 border-zinc-700 ml-4">
                        {item.modifiers.map((mod) => (
                          <div key={mod.tempId} className="flex items-center gap-2">
                            <span className="shrink-0 w-8 h-8 rounded flex items-center justify-center
                            bg-amber-500/15 border border-amber-500/25 font-sans text-xs font-bold text-amber-400">
                              OBS
                            </span>

                            <input
                              type="text"
                              value={mod.name}
                              onChange={(e) => updateModifier(item.tempId, mod.tempId, e.target.value)}
                              placeholder="Ex: Sem cebola, Bem passado, Ponto médio"
                              className="flex-1 h-8 px-3 bg-zinc-900 border border-zinc-700 rounded
                              font-sans text-sm text-gray-50 placeholder-zinc-600 outline-none focus:border-zinc-500 transition-colors"
                            />

                            <button
                              type="button"
                              onClick={() => removeModifier(item.tempId, mod.tempId)}
                              className="shrink-0 w-8 h-8 rounded flex items-center justify-center text-zinc-500 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => addModifier(item.tempId)}
                      className="flex items-center gap-1.5 ml-8 mt-1 font-sans text-xs font-medium text-zinc-500 transition-colors select-none"
                    >
                      <Plus size={12} />
                      Observações
                    </button>
                  </div>
                );
              })}
            </div>

            {status === 'error' && errorMsg && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-950/40 border border-red-800 rounded-md">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span className="font-sans text-sm text-red-400">{errorMsg}</span>
              </div>
            )}

            {!status && errorMsg && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-950/40 border border-red-800 rounded-md">
                <AlertCircle size={18} className="text-red-500 shrink-0" />
                <span className="font-sans text-sm text-red-400">{errorMsg}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-950/40 border border-emerald-800 rounded-md">
                <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                <span className="font-sans text-sm text-emerald-400">
                  Pedido {displayId} enviado com sucesso!
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full h-16 bg-emerald-500 rounded-md font-sans font-bold text-lg text-black
              select-none transition-all duration-75 active:scale-[0.97] active:opacity-80
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
        </div>
      </section>

      <ProductSidebar
        sortMode={sortMode}
        onSortChange={setSortMode}
        onAddProduct={handleAddProductFromCatalog}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />
    </div>
  );
};

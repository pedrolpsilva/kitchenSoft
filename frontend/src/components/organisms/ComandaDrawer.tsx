'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Plus, Search } from 'lucide-react';
import { useSalaoStore, ComandaItem } from '@/store/useSalaoStore';
import { PRODUCT_CATALOG, searchCatalog, CatalogItem } from '@/lib/productCatalog';
import { ButtonKDS } from '@/components/atoms/ButtonKDS';

export const ComandaDrawer: React.FC = () => {
  const {
    mesas,
    mesaSelecionadaId,
    modoEdicao,
    selecionarMesa,
    atualizarComanda,
    adicionarItemComanda,
    removerItemComanda,
  } = useSalaoStore();

  const isOpen = !modoEdicao && mesaSelecionadaId !== null;
  const mesa = mesas.find((m) => m.id === mesaSelecionadaId);
  const comanda = mesa?.comanda;

  // Estado local para adicionar novo item via busca
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CatalogItem | null>(null);
  const [quantidade, setQuantidade] = useState<number>(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Estado local para modal de exclusão
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedProduct(null); // Reseta a seleção exata
    if (val.length > 0) {
      setSuggestions(searchCatalog(val));
      setIsDropdownOpen(true);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const selectSuggestion = (product: CatalogItem) => {
    setSelectedProduct(product);
    setQuery(product.name);
    setIsDropdownOpen(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantidade <= 0) return;

    const novoItem: ComandaItem = {
      id: Date.now().toString(),
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: quantidade,
    };

    adicionarItemComanda(mesa!.id, novoItem);
    setQuery('');
    setSelectedProduct(null);
    setQuantidade(1);
  };

  const confirmDelete = (itemId: string) => {
    setItemToDelete(itemId);
  };

  const handleDelete = () => {
    if (mesa && itemToDelete) {
      removerItemComanda(mesa.id, itemToDelete);
      setItemToDelete(null);
    }
  };

  const calcularTotal = () => {
    if (!comanda || !comanda.items) return 0;
    return comanda.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  if (!isOpen || !mesa) {
    return (
      <aside
        className={`shrink-0 h-full bg-zinc-950 border-zinc-800 transition-all duration-300 ease-in-out w-0 opacity-0 border-l-0 overflow-hidden`}
      />
    );
  }

  return (
    <>
      <aside
        className={`shrink-0 h-full bg-zinc-950 border-l border-zinc-800 flex flex-col
        transition-all duration-300 ease-in-out
        w-80 opacity-100 shadow-2xl overflow-hidden z-40 relative`}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="font-sans font-bold text-lg text-emerald-400">
            Mesa {mesa.numero} - Comanda
          </h2>
          <button
            onClick={() => selecionarMesa(null)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col">
          <div className="p-5 flex flex-col gap-5 border-b border-zinc-800 shrink-0">
            {/* Responsável */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Nome do Cliente</label>
              <input
                type="text"
                value={comanda?.responsavel || ''}
                onChange={(e) => atualizarComanda(mesa.id, { responsavel: e.target.value })}
                placeholder="Ex: João Silva"
                className="bg-zinc-900 border border-zinc-800 rounded p-3 text-white text-base outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
              />
            </div>

            {/* Garçom */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-zinc-400">Garçom</label>
              <input
                type="text"
                value={comanda?.garcom || ''}
                onChange={(e) => atualizarComanda(mesa.id, { garcom: e.target.value })}
                placeholder="Ex: Carlos"
                className="bg-zinc-900 border border-zinc-800 rounded p-3 text-white text-base outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
              />
            </div>
          </div>

          {/* Adicionar Produto com Busca */}
          <div className="p-5 flex flex-col gap-3 bg-zinc-900/30 border-b border-zinc-800 shrink-0 overflow-visible relative">
            <label className="text-sm font-semibold text-zinc-400">Adicionar Item</label>
            <div className="flex flex-col gap-2 relative" ref={dropdownRef}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsDropdownOpen(true);
                  }}
                  placeholder="Buscar produto..."
                  className="w-full pl-9 pr-3 py-3 bg-zinc-900 border border-zinc-800 rounded text-white text-sm outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-600"
                />
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && suggestions.length > 0 && (
                <div className="absolute z-50 top-12 left-0 w-full max-h-48 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded-md shadow-xl custom-scrollbar flex flex-col py-1">
                  {suggestions.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectSuggestion(p)}
                      className="text-left px-3 py-2 hover:bg-zinc-700 text-sm font-sans font-medium text-gray-50 flex items-center justify-between"
                    >
                      <span className="truncate pr-2">{p.name}</span>
                      <span className="text-emerald-400 shrink-0">R$ {p.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                  className="w-20 bg-zinc-900 border border-zinc-800 rounded p-2 text-center text-white text-base outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleAddProduct}
                  disabled={!selectedProduct}
                  className="flex-1 bg-emerald-600 text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={18} />
                  Lançar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-zinc-400">Itens Lançados</h3>
            {(!comanda?.items || comanda.items.length === 0) ? (
              <p className="text-zinc-500 text-sm italic text-center mt-4">Nenhum item lançado ainda.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {comanda.items.map((item) => (
                  <li
                    key={item.id}
                    className="bg-zinc-800 rounded-lg p-3 flex items-center justify-between group"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-50 text-sm font-semibold">{item.name}</span>
                      <span className="text-zinc-400 text-xs mt-1">
                        {item.quantity}x R$ {item.price.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-sm font-mono font-bold">
                        R$ {(item.quantity * item.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 rounded-md transition-colors"
                        title="Remover item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm font-bold uppercase tracking-wider">Total</span>
            <span className="text-3xl font-mono font-bold text-gray-50">
              R$ {calcularTotal().toFixed(2)}
            </span>
          </div>
          <ButtonKDS 
            label="Fechar Conta" 
            onClick={() => alert('Função de pagamento em breve!')} 
            variant="primary" 
          />
        </div>
      </aside>

      {/* Modal de Confirmação de Exclusão */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-zinc-800 border border-zinc-700 rounded-lg p-6 flex flex-col gap-6 shadow-2xl">
            <h3 className="font-sans font-bold text-lg text-gray-50">Remover item?</h3>
            <p className="text-zinc-300 text-sm">
              Tem certeza que deseja remover este item da comanda? Essa ação não pode ser desfeita.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 h-12 bg-zinc-700 rounded font-sans font-bold text-sm text-gray-50 transition-colors hover:bg-zinc-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 h-12 bg-red-600 rounded font-sans font-bold text-sm text-white transition-colors hover:bg-red-500"
              >
                Sim, remover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

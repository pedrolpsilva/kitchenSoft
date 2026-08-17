import { create } from 'zustand';
import { ref, set as firebaseSet, update, remove, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useTenantStore } from '@/store/useTenantStore';

export type FormatoMesa = 'retangular' | 'circular';
export type StatusMesa = 'livre' | 'ocupada' | 'interditada' | 'limpeza' | 'pagamento';

export interface ComandaItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Comanda {
  responsavel: string;
  garcom: string;
  items: ComandaItem[];
}

export interface Mesa {
  id: string;
  numero: number;
  formato: FormatoMesa;
  status: StatusMesa;
  posicao: { x: number; y: number };
  tamanho: { largura: number; altura: number };
  cadeiras: number;
  zona?: string;
  comanda?: Comanda;
}

export interface SalaoState {
  mesas: Mesa[];
  modoEdicao: boolean;
  mesaSelecionadaId: string | null;
  _unsubscribe: (() => void) | null;

  setMesas: (mesas: Mesa[]) => void;
  subscribeMesas: (tenantId: string) => () => void;
  adicionarMesa: (mesa: Mesa) => void;
  atualizarMesa: (id: string, dados: Partial<Mesa>) => void;
  removerMesa: (id: string) => void;
  setModoEdicao: (ativo: boolean) => void;
  selecionarMesa: (id: string | null) => void;
  verificarColisao: (
    id: string,
    novaPosicao: { x: number; y: number },
    novoTamanho: { largura: number; altura: number }
  ) => boolean;

  atualizarComanda: (mesaId: string, dados: Partial<Comanda>) => void;
  adicionarItemComanda: (mesaId: string, item: ComandaItem) => void;
  removerItemComanda: (mesaId: string, itemId: string) => void;
  atualizarItemComanda: (mesaId: string, itemId: string, atualizacoes: Partial<ComandaItem>) => void;
}

function getMesaRef(mesaId: string) {
  const tenantId = useTenantStore.getState().tenantId;
  if (!tenantId) throw new Error('[SalaoStore] tenantId não disponível');
  return ref(database, `tenants/${tenantId}/mesas/${mesaId}`);
}

export const useSalaoStore = create<SalaoState>((set, get) => ({
  mesas: [],
  modoEdicao: false,
  mesaSelecionadaId: null,
  _unsubscribe: null,

  setMesas: (mesas) => set({ mesas }),

  subscribeMesas: (tenantId: string) => {
    const prev = get()._unsubscribe;
    if (prev) prev();

    const mesasRef = ref(database, `tenants/${tenantId}/mesas`);
    const unsubscribe = onValue(mesasRef, (snapshot) => {
      if (!snapshot.exists()) {
        set({ mesas: [] });
        return;
      }
      const data = snapshot.val() as Record<string, Mesa>;
      const mesas = Object.values(data);
      set({ mesas });
    });

    set({ _unsubscribe: unsubscribe });
    return unsubscribe;
  },

  adicionarMesa: (mesa) => {
    try {
      const mesaRef = getMesaRef(mesa.id);
      firebaseSet(mesaRef, mesa);
    } catch {
      set((state) => ({ mesas: [...state.mesas, mesa] }));
    }
  },

  atualizarMesa: (id, dados) => {
    try {
      const mesaRef = getMesaRef(id);
      update(mesaRef, dados);
    } catch {
      set((state) => ({
        mesas: state.mesas.map((m) => (m.id === id ? { ...m, ...dados } : m)),
      }));
    }
  },

  removerMesa: (id) => {
    try {
      const mesaRef = getMesaRef(id);
      remove(mesaRef);
    } catch {
      set((state) => ({
        mesas: state.mesas.filter((m) => m.id !== id),
        mesaSelecionadaId: state.mesaSelecionadaId === id ? null : state.mesaSelecionadaId,
      }));
    }
    set((state) => ({
      mesaSelecionadaId: state.mesaSelecionadaId === id ? null : state.mesaSelecionadaId,
    }));
  },

  setModoEdicao: (ativo) =>
    set({ modoEdicao: ativo, mesaSelecionadaId: null }),

  selecionarMesa: (id) => set({ mesaSelecionadaId: id }),

  verificarColisao: (id, novaPosicao, novoTamanho) => {
    const { mesas } = get();
    const outrasMesas = mesas.filter((m) => m.id !== id);

    for (const mesa of outrasMesas) {
      const colideX =
        novaPosicao.x < mesa.posicao.x + mesa.tamanho.largura &&
        novaPosicao.x + novoTamanho.largura > mesa.posicao.x;
      
      const colideY =
        novaPosicao.y < mesa.posicao.y + mesa.tamanho.altura &&
        novaPosicao.y + novoTamanho.altura > mesa.posicao.y;

      if (colideX && colideY) {
        return true;
      }
    }
    return false;
  },

  atualizarComanda: (mesaId, dados) => {
    const { mesas } = get();
    const mesa = mesas.find((m) => m.id === mesaId);
    if (!mesa) return;

    const comandaAtual = mesa.comanda || { responsavel: '', garcom: '', items: [] };
    const novaComanda = { ...comandaAtual, ...dados };

    try {
      const mesaRef = getMesaRef(mesaId);
      update(mesaRef, { comanda: novaComanda });
    } catch {
      set((state) => ({
        mesas: state.mesas.map((m) =>
          m.id === mesaId ? { ...m, comanda: novaComanda } : m
        ),
      }));
    }
  },

  adicionarItemComanda: (mesaId, item) => {
    const { mesas } = get();
    const mesa = mesas.find((m) => m.id === mesaId);
    if (!mesa) return;

    const comandaAtual = mesa.comanda || { responsavel: '', garcom: '', items: [] };
    const novaComanda = { ...comandaAtual, items: [...comandaAtual.items, item] };

    try {
      const mesaRef = getMesaRef(mesaId);
      update(mesaRef, { comanda: novaComanda });
    } catch {
      set((state) => ({
        mesas: state.mesas.map((m) =>
          m.id === mesaId ? { ...m, comanda: novaComanda } : m
        ),
      }));
    }
  },

  removerItemComanda: (mesaId, itemId) => {
    const { mesas } = get();
    const mesa = mesas.find((m) => m.id === mesaId);
    if (!mesa || !mesa.comanda) return;

    const novaComanda = {
      ...mesa.comanda,
      items: mesa.comanda.items.filter((i) => i.id !== itemId),
    };

    try {
      const mesaRef = getMesaRef(mesaId);
      update(mesaRef, { comanda: novaComanda });
    } catch {
      set((state) => ({
        mesas: state.mesas.map((m) =>
          m.id === mesaId ? { ...m, comanda: novaComanda } : m
        ),
      }));
    }
  },

  atualizarItemComanda: (mesaId, itemId, atualizacoes) => {
    const { mesas } = get();
    const mesa = mesas.find((m) => m.id === mesaId);
    if (!mesa || !mesa.comanda) return;

    const novaComanda = {
      ...mesa.comanda,
      items: mesa.comanda.items.map((i) =>
        i.id === itemId ? { ...i, ...atualizacoes } : i
      ),
    };

    try {
      const mesaRef = getMesaRef(mesaId);
      update(mesaRef, { comanda: novaComanda });
    } catch {
      set((state) => ({
        mesas: state.mesas.map((m) =>
          m.id === mesaId ? { ...m, comanda: novaComanda } : m
        ),
      }));
    }
  },
}));

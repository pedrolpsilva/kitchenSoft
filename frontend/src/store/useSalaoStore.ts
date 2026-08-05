import { create } from 'zustand';

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

  // Ações da Comanda
  atualizarComanda: (mesaId: string, dados: Partial<Comanda>) => void;
  adicionarItemComanda: (mesaId: string, item: ComandaItem) => void;
  removerItemComanda: (mesaId: string, itemId: string) => void;
  atualizarItemComanda: (mesaId: string, itemId: string, atualizacoes: Partial<ComandaItem>) => void;
}

export const useSalaoStore = create<SalaoState>((set, get) => ({
  mesas: [
    // Mock inicial para testarmos
    {
      id: '1',
      numero: 1,
      formato: 'retangular',
      status: 'livre',
      posicao: { x: 40, y: 40 },
      tamanho: { largura: 80, altura: 80 },
      cadeiras: 4,
    },
    {
      id: '2',
      numero: 2,
      formato: 'circular',
      status: 'ocupada',
      posicao: { x: 160, y: 40 },
      tamanho: { largura: 80, altura: 80 },
      cadeiras: 2,
    },
  ],
  modoEdicao: false,
  mesaSelecionadaId: null,

  adicionarMesa: (mesa) =>
    set((state) => ({ mesas: [...state.mesas, mesa] })),

  atualizarMesa: (id, dados) =>
    set((state) => ({
      mesas: state.mesas.map((m) => (m.id === id ? { ...m, ...dados } : m)),
    })),

  removerMesa: (id) =>
    set((state) => ({
      mesas: state.mesas.filter((m) => m.id !== id),
      // Limpa a seleção se a mesa selecionada for removida
      mesaSelecionadaId: state.mesaSelecionadaId === id ? null : state.mesaSelecionadaId,
    })),

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
        return true; // Há colisão
      }
    }
    return false; // Sem colisão
  },

  atualizarComanda: (mesaId, dados) =>
    set((state) => ({
      mesas: state.mesas.map((m) => {
        if (m.id === mesaId) {
          const comandaAtual = m.comanda || { responsavel: '', garcom: '', items: [] };
          return { ...m, comanda: { ...comandaAtual, ...dados } };
        }
        return m;
      }),
    })),

  adicionarItemComanda: (mesaId, item) =>
    set((state) => ({
      mesas: state.mesas.map((m) => {
        if (m.id === mesaId) {
          const comandaAtual = m.comanda || { responsavel: '', garcom: '', items: [] };
          return {
            ...m,
            comanda: { ...comandaAtual, items: [...comandaAtual.items, item] },
          };
        }
        return m;
      }),
    })),

  removerItemComanda: (mesaId, itemId) =>
    set((state) => ({
      mesas: state.mesas.map((m) => {
        if (m.id === mesaId && m.comanda) {
          return {
            ...m,
            comanda: {
              ...m.comanda,
              items: m.comanda.items.filter((i) => i.id !== itemId),
            },
          };
        }
        return m;
      }),
    })),

  atualizarItemComanda: (mesaId, itemId, atualizacoes) =>
    set((state) => ({
      mesas: state.mesas.map((m) => {
        if (m.id === mesaId && m.comanda) {
          return {
            ...m,
            comanda: {
              ...m.comanda,
              items: m.comanda.items.map((i) =>
                i.id === itemId ? { ...i, ...atualizacoes } : i
              ),
            },
          };
        }
        return m;
      }),
    })),
}));

/* ─── Product Catalog ─── Kitchen Soft ─────────────────────────── */

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
}

export const PRODUCT_CATALOG: CatalogItem[] = [
  /* ── Pizzas ── */
  { id: 'pizza-calabresa-p', name: 'Pizza Calabresa - Pequena', category: 'Pizza', price: 35.90 },
  { id: 'pizza-calabresa-m', name: 'Pizza Calabresa - Média', category: 'Pizza', price: 49.90 },
  { id: 'pizza-calabresa-g', name: 'Pizza Calabresa - Grande', category: 'Pizza', price: 65.90 },
  { id: 'pizza-margherita-p', name: 'Pizza Margherita - Pequena', category: 'Pizza', price: 32.90 },
  { id: 'pizza-margherita-m', name: 'Pizza Margherita - Média', category: 'Pizza', price: 45.90 },
  { id: 'pizza-margherita-g', name: 'Pizza Margherita - Grande', category: 'Pizza', price: 59.90 },
  { id: 'pizza-portuguesa-g', name: 'Pizza Portuguesa - Grande', category: 'Pizza', price: 68.90 },
  { id: 'pizza-frango-catupiry-g', name: 'Pizza Frango c/ Catupiry - Grande', category: 'Pizza', price: 69.90 },
  { id: 'pizza-4queijos-g', name: 'Pizza 4 Queijos - Grande', category: 'Pizza', price: 72.90 },
  { id: 'pizza-pepperoni-g', name: 'Pizza Pepperoni - Grande', category: 'Pizza', price: 75.90 },

  /* ── Hambúrgueres ── */
  { id: 'hamburguer-classico', name: 'Hambúrguer Clássico', category: 'Hambúrguer', price: 22.90 },
  { id: 'hamburguer-duplo', name: 'Hambúrguer Duplo', category: 'Hambúrguer', price: 29.90 },
  { id: 'x-bacon', name: 'X-Bacon', category: 'Hambúrguer', price: 25.90 },
  { id: 'x-tudo', name: 'X-Tudo', category: 'Hambúrguer', price: 32.90 },
  { id: 'x-salada', name: 'X-Salada', category: 'Hambúrguer', price: 20.90 },
  { id: 'x-egg', name: 'X-Egg', category: 'Hambúrguer', price: 21.90 },
  { id: 'x-frango', name: 'X-Frango', category: 'Hambúrguer', price: 23.90 },

  /* ── Porções ── */
  { id: 'batata-frita-p', name: 'Batata Frita - Pequena', category: 'Porção', price: 15.90 },
  { id: 'batata-frita-m', name: 'Batata Frita - Média', category: 'Porção', price: 22.90 },
  { id: 'batata-frita-g', name: 'Batata Frita - Grande', category: 'Porção', price: 29.90 },
  { id: 'onion-rings', name: 'Onion Rings', category: 'Porção', price: 25.90 },
  { id: 'nuggets-6', name: 'Nuggets (6 un)', category: 'Porção', price: 14.90 },
  { id: 'nuggets-12', name: 'Nuggets (12 un)', category: 'Porção', price: 24.90 },
  { id: 'porcao-calabresa', name: 'Porção de Calabresa', category: 'Porção', price: 32.90 },
  { id: 'porcao-frango', name: 'Porção de Frango a Passarinho', category: 'Porção', price: 35.90 },

  /* ── Pastéis ── */
  { id: 'pastel-carne', name: 'Pastel de Carne', category: 'Pastel', price: 8.90 },
  { id: 'pastel-queijo', name: 'Pastel de Queijo', category: 'Pastel', price: 8.90 },
  { id: 'pastel-frango', name: 'Pastel de Frango', category: 'Pastel', price: 9.90 },
  { id: 'pastel-pizza', name: 'Pastel de Pizza', category: 'Pastel', price: 10.90 },

  /* ── Bebidas ── */
  { id: 'coca-lata', name: 'Coca-Cola Lata', category: 'Bebida', price: 6.90 },
  { id: 'coca-600', name: 'Coca-Cola 600ml', category: 'Bebida', price: 9.90 },
  { id: 'guarana-lata', name: 'Guaraná Lata', category: 'Bebida', price: 6.90 },
  { id: 'guarana-600', name: 'Guaraná 600ml', category: 'Bebida', price: 9.90 },
  { id: 'suco-laranja', name: 'Suco de Laranja Natural', category: 'Bebida', price: 12.90 },
  { id: 'suco-limao', name: 'Suco de Limão Natural', category: 'Bebida', price: 10.90 },
  { id: 'agua-mineral', name: 'Água Mineral 500ml', category: 'Bebida', price: 4.90 },
  { id: 'agua-gas', name: 'Água com Gás 500ml', category: 'Bebida', price: 5.90 },

  /* ── Açaí ── */
  { id: 'acai-p', name: 'Açaí - Pequeno (300ml)', category: 'Açaí', price: 18.90 },
  { id: 'acai-m', name: 'Açaí - Médio (500ml)', category: 'Açaí', price: 24.90 },
  { id: 'acai-g', name: 'Açaí - Grande (700ml)', category: 'Açaí', price: 32.90 },

  /* ── Sobremesas ── */
  { id: 'pudim', name: 'Pudim', category: 'Sobremesa', price: 12.90 },
  { id: 'petit-gateau', name: 'Petit Gâteau', category: 'Sobremesa', price: 22.90 },
  { id: 'brownie', name: 'Brownie com Sorvete', category: 'Sobremesa', price: 19.90 },
];

/**
 * Normalizes text for Portuguese search: removes accents and converts to lowercase.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Fuzzy-matches a query against the product catalog.
 * Accent-insensitive and case-insensitive.
 */
export function searchCatalog(query: string): CatalogItem[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];
  return PRODUCT_CATALOG.filter((item) =>
    normalizeText(item.name).includes(normalizedQuery)
  );
}

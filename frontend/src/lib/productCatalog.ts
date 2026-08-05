/* ─── Product Catalog ─── Kitchen Soft ─────────────────────────── */

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
}

export const PRODUCT_CATALOG: CatalogItem[] = [
  /* ── Pizzas ── */
  { id: 'pizza-calabresa-p', name: 'Pizza Calabresa - Pequena', category: 'Pizza' },
  { id: 'pizza-calabresa-m', name: 'Pizza Calabresa - Média', category: 'Pizza' },
  { id: 'pizza-calabresa-g', name: 'Pizza Calabresa - Grande', category: 'Pizza' },
  { id: 'pizza-margherita-p', name: 'Pizza Margherita - Pequena', category: 'Pizza' },
  { id: 'pizza-margherita-m', name: 'Pizza Margherita - Média', category: 'Pizza' },
  { id: 'pizza-margherita-g', name: 'Pizza Margherita - Grande', category: 'Pizza' },
  { id: 'pizza-portuguesa-g', name: 'Pizza Portuguesa - Grande', category: 'Pizza' },
  { id: 'pizza-frango-catupiry-g', name: 'Pizza Frango c/ Catupiry - Grande', category: 'Pizza' },
  { id: 'pizza-4queijos-g', name: 'Pizza 4 Queijos - Grande', category: 'Pizza' },
  { id: 'pizza-pepperoni-g', name: 'Pizza Pepperoni - Grande', category: 'Pizza' },

  /* ── Hambúrgueres ── */
  { id: 'hamburguer-classico', name: 'Hambúrguer Clássico', category: 'Hambúrguer' },
  { id: 'hamburguer-duplo', name: 'Hambúrguer Duplo', category: 'Hambúrguer' },
  { id: 'x-bacon', name: 'X-Bacon', category: 'Hambúrguer' },
  { id: 'x-tudo', name: 'X-Tudo', category: 'Hambúrguer' },
  { id: 'x-salada', name: 'X-Salada', category: 'Hambúrguer' },
  { id: 'x-egg', name: 'X-Egg', category: 'Hambúrguer' },
  { id: 'x-frango', name: 'X-Frango', category: 'Hambúrguer' },

  /* ── Porções ── */
  { id: 'batata-frita-p', name: 'Batata Frita - Pequena', category: 'Porção' },
  { id: 'batata-frita-m', name: 'Batata Frita - Média', category: 'Porção' },
  { id: 'batata-frita-g', name: 'Batata Frita - Grande', category: 'Porção' },
  { id: 'onion-rings', name: 'Onion Rings', category: 'Porção' },
  { id: 'nuggets-6', name: 'Nuggets (6 un)', category: 'Porção' },
  { id: 'nuggets-12', name: 'Nuggets (12 un)', category: 'Porção' },
  { id: 'porcao-calabresa', name: 'Porção de Calabresa', category: 'Porção' },
  { id: 'porcao-frango', name: 'Porção de Frango a Passarinho', category: 'Porção' },

  /* ── Pastéis ── */
  { id: 'pastel-carne', name: 'Pastel de Carne', category: 'Pastel' },
  { id: 'pastel-queijo', name: 'Pastel de Queijo', category: 'Pastel' },
  { id: 'pastel-frango', name: 'Pastel de Frango', category: 'Pastel' },
  { id: 'pastel-pizza', name: 'Pastel de Pizza', category: 'Pastel' },

  /* ── Bebidas ── */
  { id: 'coca-lata', name: 'Coca-Cola Lata', category: 'Bebida' },
  { id: 'coca-600', name: 'Coca-Cola 600ml', category: 'Bebida' },
  { id: 'guarana-lata', name: 'Guaraná Lata', category: 'Bebida' },
  { id: 'guarana-600', name: 'Guaraná 600ml', category: 'Bebida' },
  { id: 'suco-laranja', name: 'Suco de Laranja Natural', category: 'Bebida' },
  { id: 'suco-limao', name: 'Suco de Limão Natural', category: 'Bebida' },
  { id: 'agua-mineral', name: 'Água Mineral 500ml', category: 'Bebida' },
  { id: 'agua-gas', name: 'Água com Gás 500ml', category: 'Bebida' },

  /* ── Açaí ── */
  { id: 'acai-p', name: 'Açaí - Pequeno (300ml)', category: 'Açaí' },
  { id: 'acai-m', name: 'Açaí - Médio (500ml)', category: 'Açaí' },
  { id: 'acai-g', name: 'Açaí - Grande (700ml)', category: 'Açaí' },

  /* ── Sobremesas ── */
  { id: 'pudim', name: 'Pudim', category: 'Sobremesa' },
  { id: 'petit-gateau', name: 'Petit Gâteau', category: 'Sobremesa' },
  { id: 'brownie', name: 'Brownie com Sorvete', category: 'Sobremesa' },
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

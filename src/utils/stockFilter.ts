import { PerfumeProduct } from '../types';

export interface StockFilterInfo {
  hasStockFilter: boolean;
  operator: '=' | '>' | '>=' | '<' | '<=' | '!=';
  targetStock: number;
  remainingQuery: string;
  matchedStockLabel: string;
}

/**
 * Checks if a search query contains a secret stock query like:
 * - "stock 0", "stock 1", "stock 5", "stock 12"
 * - "stock:0", "stock: 3", "stock=0", "stock = 2", "stock==0"
 * - "stock>0", "stock > 2", "stock >= 1", "stock < 5", "stock <= 2", "stock != 0"
 * - "stock 0 carolina", "dior stock 2", "stock 1 hombre"
 */
export function parseStockQuery(rawQuery: string): StockFilterInfo {
  if (!rawQuery) {
    return {
      hasStockFilter: false,
      operator: '=',
      targetStock: 0,
      remainingQuery: '',
      matchedStockLabel: '',
    };
  }

  // Regex matches: "stock" with optional operator (:, =, ==, >, >=, <, <=, !=) and mandatory integer
  const stockRegex = /\bstock\s*(:|==?|>=|<=|>|<|!=)?\s*(\d+)\b/i;
  const match = rawQuery.match(stockRegex);

  if (!match) {
    return {
      hasStockFilter: false,
      operator: '=',
      targetStock: 0,
      remainingQuery: rawQuery,
      matchedStockLabel: '',
    };
  }

  const rawOp = match[1]?.trim() || '=';
  const targetStock = parseInt(match[2], 10);
  let operator: '=' | '>' | '>=' | '<' | '<=' | '!=' = '=';

  if (rawOp === '>') operator = '>';
  else if (rawOp === '>=') operator = '>=';
  else if (rawOp === '<') operator = '<';
  else if (rawOp === '<=') operator = '<=';
  else if (rawOp === '!=' || rawOp === '<>') operator = '!=';
  else operator = '=';

  // Strip the matched stock command from query to allow combining with other keywords (e.g., "stock 0 dior")
  const remainingQuery = rawQuery.replace(match[0], ' ').trim();

  let operatorSymbol = '=';
  if (operator === '>') operatorSymbol = '>';
  else if (operator === '>=') operatorSymbol = '≥';
  else if (operator === '<') operatorSymbol = '<';
  else if (operator === '<=') operatorSymbol = '≤';
  else if (operator === '!=') operatorSymbol = '≠';

  return {
    hasStockFilter: true,
    operator,
    targetStock,
    remainingQuery,
    matchedStockLabel: `Stock ${operatorSymbol} ${targetStock} pzs`,
  };
}

/**
 * Checks if a perfume product matches a stock condition and remaining text search.
 */
export function matchesStockAndSearch(
  product: PerfumeProduct,
  rawSearchTerm: string,
  normalizeFn: (s: string) => string
): boolean {
  const trimmed = rawSearchTerm.trim();
  if (!trimmed) return true;

  const stockInfo = parseStockQuery(trimmed);

  if (stockInfo.hasStockFilter) {
    const pStock = Number.isFinite(product.stock) ? product.stock : 0;

    let stockMatches = false;
    switch (stockInfo.operator) {
      case '>':
        stockMatches = pStock > stockInfo.targetStock;
        break;
      case '>=':
        stockMatches = pStock >= stockInfo.targetStock;
        break;
      case '<':
        stockMatches = pStock < stockInfo.targetStock;
        break;
      case '<=':
        stockMatches = pStock <= stockInfo.targetStock;
        break;
      case '!=':
        stockMatches = pStock !== stockInfo.targetStock;
        break;
      case '=':
      default:
        stockMatches = pStock === stockInfo.targetStock;
        break;
    }

    if (!stockMatches) {
      return false;
    }

    // If no remaining text words, stock filter alone determines match
    if (!stockInfo.remainingQuery.trim()) {
      return true;
    }

    // Otherwise, all remaining search words must match the product fields
    const searchWords = normalizeFn(stockInfo.remainingQuery).split(/\s+/).filter(Boolean);
    const searchableCombined = normalizeFn(
      `${product.name} ${product.brand} ${product.notes} ${product.description} ${product.category} ${product.sku || ''}`
    );

    return searchWords.every((word) => searchableCombined.includes(word));
  }

  // Standard non-stock text search
  const searchWords = normalizeFn(trimmed).split(/\s+/).filter(Boolean);
  const searchableCombined = normalizeFn(
    `${product.name} ${product.brand} ${product.notes} ${product.description} ${product.category} ${product.sku || ''}`
  );

  return searchWords.every((word) => searchableCombined.includes(word));
}

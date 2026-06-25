import type { Product } from "./types";
import { priceRange, inStock } from "./product";

/** A product's category slugs, preferring the multi-category array. */
function categoriesOf(p: Product): string[] {
  return p.categories?.length ? p.categories : p.category ? [p.category] : [];
}

function overlapCount(a: string[], b: string[]): number {
  const sb = new Set(b);
  return a.filter((x) => sb.has(x)).length;
}

/** Jaccard similarity of two slug lists (0–1). */
function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0;
  const sa = new Set(a);
  const sb = new Set(b);
  const inter = [...sa].filter((x) => sb.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union ? inter / union : 0;
}

/**
 * How relevant candidate `b` is to target `a`. Higher = more similar.
 * Weights, in order of influence:
 *  - shared categories (the strongest "people who like X also like Y" signal)
 *  - shared merchandising tags (best-seller, top-pick, …)
 *  - price proximity (recommend within a similar budget)
 *  - rating & availability (tie-breakers so good, in-stock items surface)
 */
export function similarityScore(a: Product, b: Product): number {
  const catA = categoriesOf(a);
  const catB = categoriesOf(b);
  let score = 0;

  score += overlapCount(catA, catB) * 50;
  score += jaccard(catA, catB) * 25;

  score += overlapCount(a.tags ?? [], b.tags ?? []) * 12;

  const pa = priceRange(a).min;
  const pb = priceRange(b).min;
  if (pa > 0 && pb > 0) {
    score += (Math.min(pa, pb) / Math.max(pa, pb)) * 15;
  }

  score += (b.rating ?? 0) * 2;
  if (inStock(b)) score += 5;

  return score;
}

/** Top-N products most similar to `target`, excluding it and inactive items. */
export function recommendForProduct(
  target: Product,
  pool: Product[],
  limit = 8,
): Product[] {
  return pool
    .filter((p) => p.id !== target.id && p.active !== false)
    .map((p) => ({ p, score: similarityScore(target, p) }))
    .sort((x, y) => y.score - x.score || (y.p.rating ?? 0) - (x.p.rating ?? 0))
    .slice(0, limit)
    .map((x) => x.p);
}

/**
 * Recommendations for a basket: average each candidate's similarity to every
 * item already in the cart. With an empty/unknown basket, falls back to the
 * best-rated in-stock products so the rail is never empty.
 */
export function recommendForBasket(
  basketProductIds: string[],
  pool: Product[],
  limit = 6,
): Product[] {
  const inBasket = new Set(basketProductIds);
  const basket = pool.filter((p) => inBasket.has(p.id));
  const candidates = pool.filter(
    (p) => p.active !== false && !inBasket.has(p.id),
  );

  if (basket.length === 0) {
    return [...candidates]
      .sort(
        (a, b) =>
          (inStock(b) ? 1 : 0) - (inStock(a) ? 1 : 0) ||
          (b.rating ?? 0) - (a.rating ?? 0),
      )
      .slice(0, limit);
  }

  return candidates
    .map((p) => ({
      p,
      score:
        basket.reduce((s, item) => s + similarityScore(item, p), 0) /
        basket.length,
    }))
    .sort((x, y) => y.score - x.score || (y.p.rating ?? 0) - (x.p.rating ?? 0))
    .slice(0, limit)
    .map((x) => x.p);
}

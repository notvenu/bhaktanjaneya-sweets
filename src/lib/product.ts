import type { CartItem, Product, Variant } from "./types";
import { getProductImage } from "./images";

/** Lowest-priced variant — used as the quick-add default on cards. */
export function defaultVariant(p: Product): Variant {
  return [...p.variants].sort((a, b) => a.price - b.price)[0];
}

/** Min/max selling price across a product's variants. */
export function priceRange(p: Product) {
  const prices = p.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return { min, max, hasRange: min !== max };
}

/** True if any variant has stock. */
export function inStock(p: Product): boolean {
  return p.variants.some((v) => v.stock > 0);
}

/** Best (highest) discount percentage across variants, or 0. */
export function bestDiscountPct(p: Product): number {
  return p.variants.reduce((best, v) => {
    if (!v.mrp || v.mrp <= v.price) return best;
    const pct = Math.round(((v.mrp - v.price) / v.mrp) * 100);
    return Math.max(best, pct);
  }, 0);
}

const TAG_WEIGHT: Record<string, number> = {
  "best-seller": 3,
  "top-pick": 2,
  combo: 1,
  new: 1,
};

/** Higher = more prominent in the default "featured" sort. */
export function featuredScore(p: Product): number {
  return p.tags.reduce((s, t) => s + (TAG_WEIGHT[t] ?? 0), 0);
}

/** Sort a product list by the shop's sort key. Returns a new array. */
export function sortProducts(items: Product[], sort: string): Product[] {
  const arr = [...items];
  const availability = (p: Product) => (inStock(p) ? 0 : 1);
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => availability(a) - availability(b) || priceRange(a).min - priceRange(b).min || byName(a, b));
    case "price-desc":
      return arr.sort((a, b) => availability(a) - availability(b) || priceRange(b).min - priceRange(a).min || byName(a, b));
    case "rating":
      return arr.sort((a, b) => availability(a) - availability(b) || b.rating - a.rating || byName(a, b));
    default:
      return arr.sort(
        (a, b) =>
          availability(a) - availability(b) ||
          featuredScore(b) - featuredScore(a) ||
          b.rating - a.rating ||
          byName(a, b),
      );
  }
}

/** Build a cart line from a product + chosen variant. */
export function toCartItem(p: Product, v: Variant, quantity = 1): CartItem {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    image: getProductImage(p),
    variantId: v.id,
    variantLabel: v.label,
    price: v.price,
    quantity,
    taxRate: p.taxRate ?? 0,
    extraCharges: p.extraCharges ?? 0,
  };
}

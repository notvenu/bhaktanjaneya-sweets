/** Default category artwork when no upload exists. */
const CATEGORY_DEFAULTS: Record<string, string> = {
  sweets: "/images/categories/sweets.svg",
  namkeen: "/images/categories/namkeen.svg",
  pickles: "/images/categories/sweets.svg",
  poddi: "/images/categories/sweets.svg",
};

/** Default product placeholders by category. */
const PRODUCT_DEFAULTS: Record<string, string> = {
  namkeen: "/images/products/namkeen-placeholder.svg",
  sweets: "/images/products/sweets-placeholder.svg",
};

export function defaultCategoryImage(slug: string): string {
  return CATEGORY_DEFAULTS[slug] ?? CATEGORY_DEFAULTS.sweets;
}

export function defaultProductImage(categorySlug: string): string {
  return PRODUCT_DEFAULTS[categorySlug] ?? PRODUCT_DEFAULTS.sweets;
}

export function getCategoryImage(category: { slug: string; image?: string | null }): string {
  const uploaded = category.image?.trim();
  return uploaded || defaultCategoryImage(category.slug);
}

export function getProductImage(product: { images?: string[]; category: string }): string {
  const uploaded = product.images?.find((img) => img?.trim());
  return uploaded || defaultProductImage(product.category);
}

export function getProductImages(product: { images?: string[]; category: string }): string[] {
  const uploaded = (product.images ?? []).filter((img) => img?.trim());
  return uploaded.length ? uploaded : [defaultProductImage(product.category)];
}

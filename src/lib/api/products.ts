import { unstable_cache } from "next/cache";
import type { Product } from "@/lib/types";
import { productFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin } from "@/lib/supabase/server";

function throwIfSupabaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function fetchActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });
  throwIfSupabaseError(error);
  return (data ?? []).map((row) => productFromRow(row));
}

/**
 * Storefront product catalog, cached so the hot pages (home, shop) don't hit
 * the database on every request. Edits appear within the revalidate window.
 */
export const getProducts = unstable_cache(fetchActiveProducts, ["storefront:products"], {
  revalidate: 120,
  tags: ["products"],
});

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  throwIfSupabaseError(error);
  return data ? productFromRow(data) : null;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("category", category)
    .order("name", { ascending: true });
  throwIfSupabaseError(error);
  return (data ?? []).map((row) => productFromRow(row));
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("active", true)
    .contains("tags", [tag])
    .order("name", { ascending: true });
  throwIfSupabaseError(error);
  return (data ?? []).map((row) => productFromRow(row));
}

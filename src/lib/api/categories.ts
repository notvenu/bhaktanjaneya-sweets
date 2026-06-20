import { unstable_cache } from "next/cache";
import type { Category } from "@/lib/types";
import { categoryFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin } from "@/lib/supabase/server";

function throwIfSupabaseError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  throwIfSupabaseError(error);
  return (data ?? []).map((row) => categoryFromRow(row));
}

/** Categories change rarely — cache them so the nav/home don't re-query each hit. */
export const getCategories = unstable_cache(fetchCategories, ["storefront:categories"], {
  revalidate: 300,
  tags: ["categories"],
});

export async function getCategory(slug: string): Promise<Category | null> {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  throwIfSupabaseError(error);
  return data ? categoryFromRow(data) : null;
}

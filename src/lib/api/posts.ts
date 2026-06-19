import type { Post } from "@/lib/types";
import { postFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin } from "@/lib/supabase/server";
/**
 * Seed posts used as a fallback until the `posts` table exists.
 * NOTE: Mock blog seed removed because mock modules were missing.
 * If the `posts` table isn't available, we return an empty list.
 */
function seedPosts(): Post[] {
  return [];
}


export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("active", true)
    .order("date", { ascending: false });

  // The storefront blog must never hard-fail. If the `posts` table isn't
  // migrated/granted yet (run migration 009), fall back to the seed posts.
  if (error) {
    console.warn("posts table unavailable, using seed posts:", error.message);
    return seedPosts();
  }
  const posts = (data ?? []).map((row) => postFromRow(row));
  return posts.length ? posts : seedPosts();
}

export async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("posts table unavailable, using seed posts:", error.message);
    return seedPosts().find((p) => p.slug === slug) ?? null;
  }
  return data ? postFromRow(data) : (seedPosts().find((p) => p.slug === slug) ?? null);
}

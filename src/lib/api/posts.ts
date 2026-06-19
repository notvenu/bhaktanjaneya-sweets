import type { Post } from "@/lib/types";
import { postFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin } from "@/lib/supabase/server";
import { blogPosts } from "@/lib/mock/blog";

/**
 * Seed posts used as a fallback until the `posts` table exists (run
 * migration 009). Keeps the storefront blog populated out of the box.
 */
function seedPosts(): Post[] {
  return blogPosts.map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    cover: p.cover,
    date: p.date,
    readMinutes: p.readMinutes,
    content: p.content,
    active: true,
  }));
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

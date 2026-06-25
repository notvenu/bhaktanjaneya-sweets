import type { Post } from "@/lib/types";
import { postFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin, isConfigured } from "@/lib/supabase/server";

export async function getPosts(): Promise<Post[]> {
  if (!isConfigured) return [];
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("active", true)
    .order("date", { ascending: false });

  if (error) {
    console.warn("posts table unavailable:", error.message);
    return [];
  }
  return (data ?? []).map((row) => postFromRow(row));
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!isConfigured) return null;
  const { data, error } = await supabaseAdmin
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn("posts table unavailable:", error.message);
    return null;
  }
  return data ? postFromRow(data) : null;
}

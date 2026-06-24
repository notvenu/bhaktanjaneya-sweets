import type { Tag } from "@/lib/types";
import { tagFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabaseAdmin
    .from("tags")
    .select("*")
    .order("sort_order", { ascending: true });
  // The tags table is added by migration 010 and may not exist yet — degrade to
  // an empty list instead of breaking the storefront.
  if (error) return [];
  return (data ?? []).map((row) => tagFromRow(row));
}

/** Tags flagged to surface as a carousel on the home page, in sort order. */
export async function getFeaturedTags(): Promise<Tag[]> {
  const { data, error } = await supabaseAdmin
    .from("tags")
    .select("*")
    .eq("featured", true)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? []).map((row) => tagFromRow(row));
}

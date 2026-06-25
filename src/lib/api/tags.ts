import type { Tag } from "@/lib/types";
import { tagFromRow } from "@/lib/supabase/mappers";
import { supabaseAdmin, isConfigured } from "@/lib/supabase/server";
import { config } from "@/lib/config";

export async function getTags(): Promise<Tag[]> {
  if (!isConfigured) return [];
  const { data, error } = await supabaseAdmin
    .from("tags")
    .select("*")
    .order("sort_order", { ascending: true });
  // The tags table is added by migration 010 and may not exist yet — degrade to
  // an empty list instead of breaking the storefront.
  if (error) return [];
  return (data ?? []).map((row) => tagFromRow(row));
}

/**
 * Tags flagged to surface as a carousel on the home page, ordered by sort_order
 * (lowest first) and capped at config.maxFeaturedTags so the home page never
 * renders more carousels than allowed even if extra tags were flagged.
 */
export async function getFeaturedTags(): Promise<Tag[]> {
  if (!isConfigured) return [];
  const { data, error } = await supabaseAdmin
    .from("tags")
    .select("*")
    .eq("featured", true)
    .order("sort_order", { ascending: true });
  if (error) return [];
  return (data ?? [])
    .map((row) => tagFromRow(row))
    .slice(0, config.maxFeaturedTags);
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { productFromRow } from "@/lib/supabase/mappers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const tag = url.searchParams.get("tag");
  let query = supabaseAdmin.from("products").select("*").eq("active", true);
  if (category) query = query.eq("category", category);
  if (tag) query = query.contains("tags", [tag]);

  const { data, error } = await query.order("name", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => productFromRow(row)));
}

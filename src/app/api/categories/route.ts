import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { categoryFromRow } from "@/lib/supabase/mappers";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => categoryFromRow(row)));
}

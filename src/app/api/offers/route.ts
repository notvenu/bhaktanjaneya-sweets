import { NextResponse } from "next/server";
import { supabaseAdmin, isConfigured } from "@/lib/supabase/server";
import { offerFromRow } from "@/lib/supabase/mappers";

export async function GET() {
  if (!isConfigured) return NextResponse.json([]);
  const { data, error } = await supabaseAdmin
    .from("offers")
    .select("*")
    .eq("active", true)
    .order("code", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => offerFromRow(row)));
}

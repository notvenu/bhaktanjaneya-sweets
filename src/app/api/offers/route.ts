import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { offerFromRow } from "@/lib/supabase/mappers";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const active = url.searchParams.get("active");
  let query = supabaseAdmin.from("offers").select("*");
  if (active === "true") query = query.eq("active", true);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => offerFromRow(row)));
}

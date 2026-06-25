import { NextResponse } from "next/server";
import { supabaseAdmin, isConfigured } from "@/lib/supabase/server";
import { categoryFromRow } from "@/lib/supabase/mappers";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const p = await params;
  if (!isConfigured) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("slug", p.slug)
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(categoryFromRow(data));
}

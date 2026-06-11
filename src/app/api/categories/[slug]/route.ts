import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { categoryFromRow } from "@/lib/supabase/mappers";

export async function GET(_req: NextRequest, { params }: { params: Promise<Record<string, string>> | Record<string, string> }) {
  const resolved = await params;
  const slug = (resolved as Record<string, string>).slug;
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ? categoryFromRow(data) : null);
}

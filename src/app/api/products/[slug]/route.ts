import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { productFromRow } from "@/lib/supabase/mappers";

export async function GET(_req: NextRequest, { params }: { params: Promise<Record<string, string>> | Record<string, string> }) {
  const resolved = await params;
  const slug = (resolved as Record<string, string>).slug;
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ? productFromRow(data) : null);
}

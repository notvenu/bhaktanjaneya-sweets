import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { issueToken } from "@/lib/server/auth";
import { customerFromRow } from "@/lib/supabase/mappers";

export async function POST(req: Request) {
  const body = await req.json();
  const phone = body?.phone;
  const code = body?.code;
  if (!phone || !code) return NextResponse.json({ error: "Missing phone or code" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("otps")
    .select("*")
    .eq("phone", phone)
    .eq("code", code)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data || new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  // Ensure customer exists
  let { data: customer } = await supabaseAdmin.from("customers").select("*").eq("phone", phone).limit(1).maybeSingle();
  if (!customer) {
    const { data: inserted } = await supabaseAdmin.from("customers").insert({ phone }).select("*").limit(1).maybeSingle();
    customer = inserted;
  }

  const token = issueToken({ sub: phone, role: "customer", phone, name: customer?.name });

  return NextResponse.json({ token, customer: customer ? customerFromRow(customer) : undefined });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const body = await req.json();
  const phone = body?.phone;
  const mode = body?.mode === "signup" ? "signup" : "login";
  if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

  const { data: customer, error: customerError } = await supabaseAdmin
    .from("customers")
    .select("phone")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();
  if (customerError) return NextResponse.json({ error: customerError.message }, { status: 500 });
  if (mode === "login" && !customer) {
    return NextResponse.json({ error: "No account found. Please sign up first." }, { status: 404 });
  }
  if (mode === "signup" && customer) {
    return NextResponse.json({ error: "An account already exists. Please log in instead." }, { status: 409 });
  }

  const code = genCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("otps").insert({ phone, code, expires_at: expiresAt });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // In production you would send via an SMS provider; never return the code there.
  const devMode = process.env.NODE_ENV !== "production";
  return NextResponse.json(devMode ? { ok: true, devCode: code } : { ok: true });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const body = await req.json();
  const phone = body?.phone;
  if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

  const code = genCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("otps").insert({ phone, code, expires_at: expiresAt });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // In production you would send via an SMS provider; never return the code there.
  const devMode = process.env.NODE_ENV !== "production";
  return NextResponse.json(devMode ? { ok: true, devCode: code } : { ok: true });
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth";
import { orderFromRow, orderToRow } from "@/lib/supabase/mappers";
import type { Order } from "@/lib/types";

function toDbOrder(body: Record<string, unknown>) {
  return orderToRow({
    ...(body as Partial<Order>),
    createdAt: new Date().toISOString(),
  });
}

export async function GET(req: Request) {
  let payload;
  try {
    payload = requireRole(req, "customer");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_phone", payload.phone ?? payload.sub)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data ?? []).map((row) => orderFromRow(row)));
}

export async function POST(req: Request) {
  const body = await req.json();
  const order = body ?? {};
  if (!order.customerPhone || !Array.isArray(order.items)) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .insert(toDbOrder(order))
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabaseAdmin.from("customers").upsert({ phone: order.customerPhone, name: order.customerName ?? null, created_at: new Date().toISOString() });

  return NextResponse.json(orderFromRow(data as Record<string, unknown>), { status: 201 });
}

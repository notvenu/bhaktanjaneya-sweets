import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { orderFromRow } from "@/lib/supabase/mappers";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/types";

type PublicOrderLookupResponse = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: Order["paymentMethod"];
  deliveryCompany?: string;
  // Intentionally returned for delivery updates, but UI will mask it.
  deliveryTrackingId?: string;
  total: number;
  items: Order["items"];
};

function normalizePhone(input: string): string {
  // Keep digits only; allow + at start, but store as digits/normalized.
  // In this repo, customer_phone is stored as a string.
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Convert things like +91-98765 43210 => 919876543210 or 9876543210.
  const digitsOnly = trimmed.replace(/\D/g, "");
  return digitsOnly;
}

function isValidPhone(phoneDigits: string): boolean {
  // Basic E.164-ish range without depending on country.
  return /^\d{8,15}$/.test(phoneDigits);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ phone: string }> | { phone: string } },
) {
  const { phone } = await params;
  const normalized = normalizePhone(phone);

  if (!normalized || !isValidPhone(normalized)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  // Return the most recent order for this phone.
  // NOTE: This endpoint is meant to be public, so it must not leak customer PII.
  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_phone", normalized)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = orderFromRow(data as Record<string, unknown>);

  const publicOrder: PublicOrderLookupResponse = {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    deliveryCompany: order.deliveryCompany,
    deliveryTrackingId: order.deliveryTrackingId,
    total: order.total,
    items: order.items,
  };

  return NextResponse.json(publicOrder);
}


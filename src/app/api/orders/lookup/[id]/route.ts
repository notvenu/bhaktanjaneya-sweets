import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { orderFromRow } from "@/lib/supabase/mappers";
import { serverError } from "@/lib/server/apiError";

/** Reduce an order id to a comparable core: drop an optional `ord_` prefix and
 *  lowercase, so display formats (uppercased, prefixed) and the stored value
 *  (e.g. a raw lowercase UUID) match regardless of how it was generated. */
function coreOrderId(input: string): string {
  return input.trim().toLowerCase().replace(/^ord_/, "");
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  const { id } = await params;
  const wanted = coreOrderId(id);

  if (!wanted || wanted.length < 4) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  // Require the order's phone too, so an order id alone can't be looked up and a
  // phone number alone can't be enumerated — both must match the same order.
  const phone = (new URL(req.url).searchParams.get("phone") ?? "").replace(/\D/g, "");
  if (!phone || phone.length < 8) {
    return NextResponse.json(
      { error: "Enter the phone number used for the order." },
      { status: 400 },
    );
  }

  // Fetch this phone's orders and match the id by its core form, so the lookup
  // works whether ids are stored as raw UUIDs or with an `ord_` prefix.
  const { data: rows, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("customer_phone", phone);

  if (error) {
    return serverError(error);
  }
  const data = (rows ?? []).find(
    (row) => coreOrderId(String((row as { id?: string }).id ?? "")) === wanted,
  );
  if (!data) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = orderFromRow(data as Record<string, unknown>);

  // Public lookup should not leak anything extra beyond what the customer-facing
  // order status page needs.
  return NextResponse.json({
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    deliveryCompany: order.deliveryCompany,
    deliveryTrackingId: order.deliveryTrackingId,
    total: order.total,
    items: order.items,
  });
}


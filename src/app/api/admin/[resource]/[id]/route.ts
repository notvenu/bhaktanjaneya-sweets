import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth";
import {
  categoryFromRow,
  categoryToRow,
  offerFromRow,
  offerToRow,
  orderFromRow,
  orderToRow,
  productFromRow,
  productToRow,
} from "@/lib/supabase/mappers";

type Resource = "products" | "categories" | "offers" | "orders";

function patchTable(resource: Resource) {
  return resource;
}

function payloadFor(resource: Resource, body: Record<string, unknown>) {
  if (resource === "products") return productToRow(body as never);
  if (resource === "categories") return categoryToRow(body as never);
  if (resource === "offers") return offerToRow(body as never);
  if (resource === "orders") return orderToRow(body as never);
  return body;
}

function formatRow(resource: Resource, row: Record<string, unknown>) {
  if (resource === "products") return productFromRow(row);
  if (resource === "categories") return categoryFromRow(row);
  if (resource === "offers") return offerFromRow(row);
  if (resource === "orders") return orderFromRow(row);
  return row;
}

function validateOrderPatch(resource: Resource, body: Record<string, unknown>) {
  if (resource === "orders" && body.status === "shipped") {
    const company = typeof body.deliveryCompany === "string" ? body.deliveryCompany.trim() : "";
    const tracking = typeof body.deliveryTrackingId === "string" ? body.deliveryTrackingId.trim() : "";
    if (!company || !tracking) {
      return "Delivery company and tracking ID are required when marking an order as shipped.";
    }
  }
  return null;
}

async function updateResource(
  resource: Resource,
  id: string,
  body: Record<string, unknown>,
) {
  const validationError = validateOrderPatch(resource, body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const payload = payloadFor(resource, body);
  const { data, error } = await supabaseAdmin
    .from(patchTable(resource))
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(formatRow(resource, data as Record<string, unknown>));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Record<string, string>> | Record<string, string> }) {
  try {
    requireRole(req, "admin");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as Record<string, unknown>;
  const p = (await params) as Record<string, string>;
  return updateResource(p.resource as Resource, p.id, body);
}

export async function PATCH(req: NextRequest, context: { params: Promise<Record<string, string>> | Record<string, string> }) {
  try {
    requireRole(req, "admin");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const p = (await context.params) as Record<string, string>;
  return updateResource(p.resource as Resource, p.id, body);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<Record<string, string>> | Record<string, string> }) {
  try {
    requireRole(req, "admin");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
  const p = (await params) as Record<string, string>;
  const { error } = await supabaseAdmin.from(patchTable(p.resource as Resource)).delete().eq("id", p.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

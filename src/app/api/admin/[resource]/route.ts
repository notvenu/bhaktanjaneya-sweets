import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requireRole } from "@/lib/server/auth";
import {
  categoryFromRow,
  categoryToRow,
  customerFromRow,
  offerFromRow,
  offerToRow,
  orderFromRow,
  orderToRow,
  productFromRow,
  productToRow,
} from "@/lib/supabase/mappers";

type Resource = "products" | "categories" | "offers" | "orders" | "customers";

function resourceTable(resource: Resource) {
  return resource;
}

function formatRows(resource: Resource, rows: Record<string, unknown>[]) {
  if (resource === "products") return rows.map(productFromRow);
  if (resource === "categories") return rows.map(categoryFromRow);
  if (resource === "offers") return rows.map(offerFromRow);
  if (resource === "orders") return rows.map(orderFromRow);
  return rows;
}

function formatRow(resource: Resource, row: Record<string, unknown>) {
  return formatRows(resource, [row])[0];
}

function payloadFor(resource: Resource, body: Record<string, unknown>) {
  if (resource === "products") return productToRow(body as never);
  if (resource === "categories") return categoryToRow(body as never);
  if (resource === "offers") return offerToRow(body as never);
  if (resource === "orders") return orderToRow(body as never);
  return body;
}

export async function GET(req: NextRequest, { params }: { params: Promise<Record<string, string>> | Record<string, string> }) {
  try {
    requireRole(req, "admin");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }

  const p = (await params) as Record<string, string>;
  const resource = p.resource as Resource;
  if (!resourceTable(resource)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const query = supabaseAdmin.from(resourceTable(resource)).select("*");
  const { data, error } = resource === "orders" ? await query.order("created_at", { ascending: false }) : await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (resource === "customers") {
    const { data: orders } = await supabaseAdmin.from("orders").select("customer_phone");
    const counts = new Map<string, number>();
    (orders ?? []).forEach((row) => {
      const phone = (row as { customer_phone?: string }).customer_phone;
      if (!phone) return;
      counts.set(phone, (counts.get(phone) ?? 0) + 1);
    });
    const customers = (data ?? []).map((row) => customerFromRow(row as Record<string, unknown>, counts.get((row as { phone?: string }).phone ?? "") ?? 0));
    return NextResponse.json(customers);
  }

  return NextResponse.json(formatRows(resource, (data ?? []) as Record<string, unknown>[]));
}

export async function POST(req: NextRequest, { params }: { params: Promise<Record<string, string>> | Record<string, string> }) {
  try {
    requireRole(req, "admin");
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized" }, { status: 401 });
  }
  const p = (await params) as Record<string, string>;
  const resource = p.resource as Resource;
  const body = (await req.json()) as Record<string, unknown>;
  const table = resourceTable(resource);
  // Slug uniqueness enforcement (case-insensitive) + normalization for categories/products.
  // We treat collisions as duplicates based on the normalized slug.
  const normalizeSlug = (value: unknown) => {
    if (typeof value !== "string") return "";
    // betterSlugify already lowercases + normalizes punctuation/diacritics.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@/lib/utils").betterSlugify(value).trim();
  };

  let payload = payloadFor(resource, body);

  if (resource === "categories" || resource === "products") {
    const incomingSlug = normalizeSlug((body as { slug?: unknown })?.slug);


    if (!incomingSlug) return NextResponse.json({ error: "Slug is required." }, { status: 400 });

    // Normalize and apply slug to payload too, so DB always stores consistent values.
    payload = { ...payload, slug: incomingSlug };

    const { data: existing, error: slugCheckError } = await supabaseAdmin
      .from(table)
      .select("id")
      .eq("slug", incomingSlug)
      .limit(1);

    if (slugCheckError) {
      return NextResponse.json({ error: slugCheckError.message }, { status: 500 });
    }

    if ((existing ?? []).length > 0) {
      // If admin is creating a new record with same slug, reject.
      return NextResponse.json({ error: "Slug already exists. Please choose a different name/slug." }, { status: 409 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(payload)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(formatRow(resource, data as Record<string, unknown>), { status: 201 });

}

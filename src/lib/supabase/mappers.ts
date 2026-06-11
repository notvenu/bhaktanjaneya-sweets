import type { Category, Customer, Offer, Order, Product } from "@/lib/types";

type Row = Record<string, unknown>;

function optionalStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function productFromRow(row: Row): Product {
  return {
    ...(row as unknown as Product),
    categoryLabel: (row.category_label as string | null | undefined) ?? (row as unknown as Product).categoryLabel,
    images: optionalStringArray(row.images),
    variants: Array.isArray(row.variants) ? (row.variants as Product["variants"]) : [],
    tags: optionalStringArray(row.tags),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    active: row.active !== false,
    badges: optionalStringArray(row.badges),
  };
}

export function productToRow(product: Product): Row {
  const { categoryLabel, reviewCount, ...rest } = product;
  return {
    ...rest,
    category_label: categoryLabel ?? null,
    review_count: reviewCount,
  };
}

export function categoryFromRow(row: Row): Category {
  const { sort_order, ...rest } = row;
  return {
    ...(rest as unknown as Category),
    order: (sort_order as number | null | undefined) ?? undefined,
  };
}

export function categoryToRow(category: Category): Row {
  const { order, ...rest } = category;
  return {
    ...rest,
    sort_order: order ?? null,
  };
}

export function offerFromRow(row: Row): Offer {
  const { min_subtotal, starts_at, ends_at, ...rest } = row;
  return {
    ...(rest as unknown as Offer),
    minSubtotal: (min_subtotal as number | null | undefined) ?? undefined,
    startsAt: (starts_at as string | null | undefined) ?? undefined,
    endsAt: (ends_at as string | null | undefined) ?? undefined,
  };
}

export function offerToRow(offer: Offer): Row {
  const { minSubtotal, startsAt, endsAt, ...rest } = offer;
  return {
    ...rest,
    min_subtotal: minSubtotal ?? null,
    starts_at: startsAt ?? null,
    ends_at: endsAt ?? null,
  };
}

export function orderFromRow(row: Row): Order {
  const { customer_phone, customer_name, payment_status, created_at, ...rest } = row;
  return {
    ...(rest as unknown as Order),
    customerPhone: customer_phone as string,
    customerName: (customer_name as string | null | undefined) ?? undefined,
    paymentStatus: payment_status as Order["paymentStatus"],
    createdAt: created_at as string,
  };
}

export function orderToRow(order: Partial<Order>): Row {
  const { customerPhone, customerName, paymentStatus, createdAt, ...rest } = order;
  return {
    ...rest,
    ...(customerPhone !== undefined ? { customer_phone: customerPhone } : {}),
    ...(customerName !== undefined ? { customer_name: customerName ?? null } : {}),
    ...(paymentStatus !== undefined ? { payment_status: paymentStatus } : {}),
    ...(createdAt !== undefined ? { created_at: createdAt } : {}),
  };
}

export function customerFromRow(row: Row, ordersCount = 0): Customer {
  const { created_at, ...rest } = row;
  return {
    ...(rest as unknown as Customer),
    createdAt: created_at as string,
    ordersCount,
  };
}

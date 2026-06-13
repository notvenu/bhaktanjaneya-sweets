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
    taxRate: Number(row.tax_rate ?? 0),
    extraCharges: Number(row.extra_charges ?? 0),
  };
}

export function productToRow(product: Product): Row {
  const { categoryLabel, reviewCount, taxRate, extraCharges, ...rest } = product;
  return {
    ...rest,
    category_label: categoryLabel ?? null,
    review_count: reviewCount,
    tax_rate: taxRate ?? 0,
    extra_charges: extraCharges ?? 0,
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
  const {
    customer_phone,
    customer_name,
    customer_email,
    shipping_address,
    notes,
    payment_method,
    payment_status,
    razorpay_order_id,
    razorpay_payment_id,
    delivery_company,
    delivery_tracking_id,
    tax_amount,
    extra_charges_amount,
    created_at,
    ...rest
  } = row;
  return {
    ...(rest as unknown as Order),
    customerPhone: customer_phone as string,
    customerName: (customer_name as string | null | undefined) ?? undefined,
    customerEmail: (customer_email as string | null | undefined) ?? undefined,
    shippingAddress: (shipping_address as Order["shippingAddress"]) ?? undefined,
    notes: (notes as string | null | undefined) ?? undefined,
    paymentMethod: (payment_method as Order["paymentMethod"]) ?? undefined,
    paymentStatus: payment_status as Order["paymentStatus"],
    razorpayOrderId: (razorpay_order_id as string | null | undefined) ?? undefined,
    razorpayPaymentId: (razorpay_payment_id as string | null | undefined) ?? undefined,
    deliveryCompany: (delivery_company as string | null | undefined) ?? undefined,
    deliveryTrackingId: (delivery_tracking_id as string | null | undefined) ?? undefined,
    taxAmount: Number(tax_amount ?? 0) || undefined,
    extraChargesAmount: Number(extra_charges_amount ?? 0) || undefined,
    createdAt: created_at as string,
  };
}

export function orderToRow(order: Partial<Order>): Row {
  const {
    customerPhone,
    customerName,
    customerEmail,
    shippingAddress,
    notes,
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    deliveryCompany,
    deliveryTrackingId,
    taxAmount,
    extraChargesAmount,
    createdAt,
    ...rest
  } = order;
  return {
    ...rest,
    ...(customerPhone !== undefined ? { customer_phone: customerPhone } : {}),
    ...(customerName !== undefined ? { customer_name: customerName ?? null } : {}),
    ...(customerEmail !== undefined ? { customer_email: customerEmail ?? null } : {}),
    ...(shippingAddress !== undefined ? { shipping_address: shippingAddress ?? null } : {}),
    ...(notes !== undefined ? { notes: notes ?? null } : {}),
    ...(paymentMethod !== undefined ? { payment_method: paymentMethod ?? null } : {}),
    ...(paymentStatus !== undefined ? { payment_status: paymentStatus } : {}),
    ...(razorpayOrderId !== undefined ? { razorpay_order_id: razorpayOrderId ?? null } : {}),
    ...(razorpayPaymentId !== undefined ? { razorpay_payment_id: razorpayPaymentId ?? null } : {}),
    ...(deliveryCompany !== undefined ? { delivery_company: deliveryCompany ?? null } : {}),
    ...(deliveryTrackingId !== undefined ? { delivery_tracking_id: deliveryTrackingId ?? null } : {}),
    ...(taxAmount !== undefined ? { tax_amount: taxAmount ?? 0 } : {}),
    ...(extraChargesAmount !== undefined ? { extra_charges_amount: extraChargesAmount ?? 0 } : {}),
    ...(createdAt !== undefined ? { created_at: createdAt } : {}),
  };
}

export function customerFromRow(row: Row, ordersCount = 0): Customer {
  const { created_at, saved_address, ...rest } = row;
  return {
    ...(rest as unknown as Customer),
    savedAddress: (saved_address as Customer["savedAddress"]) ?? undefined,
    createdAt: created_at as string,
    ordersCount,
  };
}

export function customerToRow(customer: Partial<Customer>): Row {
  const { savedAddress, createdAt, ordersCount, ...rest } = customer;
  return {
    ...rest,
    ...(savedAddress !== undefined ? { saved_address: savedAddress ?? null } : {}),
    ...(createdAt !== undefined ? { created_at: createdAt } : {}),
  };
}

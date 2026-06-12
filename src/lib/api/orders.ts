import type { Order, OrderStatus } from "@/lib/types";
import { apiPatch, apiPost } from "./client";

export async function createOrder(order: Order): Promise<Order> {
  return apiPost<Order>("/orders", order);
}

export async function cancelOrder(orderId: string): Promise<Order> {
  return apiPatch<Order>(`/orders/${orderId}`, { action: "cancel" });
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  deliveryDetails?: { deliveryCompany: string; deliveryTrackingId: string }
): Promise<Order> {
  return apiPatch<Order>(`/admin/orders/${orderId}`, {
    status,
    ...deliveryDetails,
  });
}

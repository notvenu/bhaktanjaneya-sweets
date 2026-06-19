import { apiPost } from "./client";

// ─── Razorpay seam (phase 2) ───────────────────────────────────────────────
// The frontend NEVER sees key_secret. Flow:
//   1. createRazorpayOrder(amount)  -> backend creates an order via Razorpay
//      Orders API and returns { id, amount, currency, keyId }.
//   2. Frontend opens Razorpay Checkout with that order id + keyId.
//   3. On success, Checkout returns a signature; send it to
//      verifyRazorpayPayment(...) so the backend can verify it (HMAC-SHA256
//      with key_secret) before marking the order paid.

export interface RazorpayOrder {
  id: string;
  amount: number; // in paise
  currency: string;
  keyId: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  /** Our order id, so the backend can bind the payment and mark it paid. */
  orderId?: string;
}

export async function createRazorpayOrder(
  amountInr: number,
): Promise<RazorpayOrder> {
  return apiPost<RazorpayOrder>("/payments/razorpay/order", {
    amount: amountInr * 100,
  });
}

export async function verifyRazorpayPayment(
  payload: RazorpayVerifyPayload,
): Promise<{ verified: boolean }> {
  return apiPost<{ verified: boolean }>("/payments/razorpay/verify", payload);
}

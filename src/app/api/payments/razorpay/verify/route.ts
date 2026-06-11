import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!secret) return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const expected = hmac.digest("hex");
  const verified = expected === razorpay_signature;
  return NextResponse.json({ verified });
}

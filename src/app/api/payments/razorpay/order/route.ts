import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const amount = body?.amount;
  if (!amount) return NextResponse.json({ error: "Missing amount" }, { status: 400 });

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";
  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error: "Razorpay not configured",
        missing: {
          NEXT_PUBLIC_RAZORPAY_KEY_ID: !keyId,
          RAZORPAY_KEY_SECRET: !keySecret,
        },
      },
      { status: 500 },
    );
  }

  // Create order via Razorpay REST API
  const resp = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount, currency: "INR" }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    return NextResponse.json({ error: txt }, { status: 500 });
  }
  const data = await resp.json();
  return NextResponse.json({ id: data.id, amount: data.amount, currency: data.currency, keyId });
}

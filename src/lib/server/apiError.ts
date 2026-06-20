import { NextResponse } from "next/server";

/**
 * JSON error response for API routes. In production it returns a generic
 * message (the real one is logged server-side) so raw database/internal errors
 * aren't leaked to clients; in development it surfaces the real message.
 */
export function serverError(error: unknown, status = 500, fallback = "Something went wrong. Please try again.") {
  const message = error instanceof Error ? error.message : String(error);
  console.error("[api]", message);
  const safe = process.env.NODE_ENV === "production" ? fallback : message;
  return NextResponse.json({ error: safe }, { status });
}

import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin image proxy for Instagram / Facebook CDN thumbnails.
 *
 * Instagram's CDN serves images with `Cross-Origin-Resource-Policy: same-origin`,
 * so the browser blocks them when loaded directly from our pages
 * (net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin). Fetching them server-side and
 * re-serving from our own origin sidesteps that — the bytes are identical, only
 * the origin changes.
 *
 * The host is allow-listed to Instagram/Facebook CDNs so this can't be used as a
 * general-purpose open proxy (SSRF / hot-link laundering).
 */
const ALLOWED_HOST_SUFFIXES = [".cdninstagram.com", ".fbcdn.net"];

function isAllowedHost(host: string): boolean {
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  if (!target) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(target);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (url.protocol !== "https:" || !isAllowedHost(url.hostname)) {
    return new NextResponse("Forbidden host", { status: 403 });
  }

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BhaktanjaneyaSweets/1.0)",
        Accept: "image/avif,image/webp,image/*,*/*;q=0.8",
      },
      // Cache the fetched image; Instagram CDN URLs are content-addressed.
      next: { revalidate: 86400 },
    });

    const contentType = upstream.headers.get("content-type") ?? "";
    if (!upstream.ok || !upstream.body || !contentType.startsWith("image/")) {
      return new NextResponse("Upstream image unavailable", { status: 502 });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
      },
    });
  } catch {
    return new NextResponse("Fetch failed", { status: 502 });
  }
}

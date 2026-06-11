import crypto from "crypto";

type Role = "admin" | "customer";

export interface TokenPayload {
  sub: string;
  role: Role;
  email?: string;
  name?: string;
  phone?: string;
  exp: number;
}

function getSecret() {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return "dev-auth-token-secret-change-me";
    }
    throw new Error("AUTH_TOKEN_SECRET is not configured");
  }
  return secret;
}

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function issueToken(payload: Omit<TokenPayload, "exp">, ttlSeconds = 60 * 60 * 24 * 7) {
  const body: TokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const raw = base64UrlEncode(JSON.stringify(body));
  const sig = crypto.createHmac("sha256", getSecret()).update(raw).digest("base64url");
  return `${raw}.${sig}`;
}

export function verifyToken(token: string): TokenPayload {
  const [raw, sig] = token.split(".");
  if (!raw || !sig) throw new Error("Invalid token");
  const expected = crypto.createHmac("sha256", getSecret()).update(raw).digest("base64url");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("Invalid token");
  }
  const payload = JSON.parse(base64UrlDecode(raw)) as TokenPayload;
  if (payload.exp * 1000 < Date.now()) throw new Error("Token expired");
  return payload;
}

export function getBearerToken(req: Request) {
  const header = req.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

export function requireRole(req: Request, role: Role) {
  const token = getBearerToken(req);
  if (!token) throw new Error("Missing bearer token");
  const payload = verifyToken(token);
  if (payload.role !== role) throw new Error("Forbidden");
  return payload;
}

"use client";

/**
 * Production-ready API client with structured error handling.
 * Converts failed responses into a standard ApiError that can be caught by UI components.
 */
export class ApiError extends Error {
  constructor(public message: string, public status: number, public data?: any) {
    super(message);
    this.name = "ApiError";
  }
}

/** Same-origin Next.js API routes live under /api. Empty env must still resolve to /api. */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api").replace(/\/$/, "");

function authTokenFor(path: string): string | null {
  if (typeof window === "undefined") return null;

  const readToken = (key: string) => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return null;
      const { token } = JSON.parse(raw) as { token?: string };
      return token ?? null;
    } catch {
      return null;
    }
  };

  if (path.startsWith("/admin/")) {
    return readToken("bas_admin_session") ?? readToken("bas_session");
  }
  return readToken("bas_session");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = authTokenFor(path);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: { error?: string; message?: string } = {};
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }
    const message =
      errorData.error ??
      errorData.message ??
      response.statusText ??
      "An unexpected error occurred";
    throw new ApiError(message, response.status, errorData);
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

export const apiGet = <T>(path: string) => request<T>(path, { method: "GET" });
export const apiPost = <T>(path: string, body: any) => request<T>(path, { method: "POST", body: JSON.stringify(body) });
export const apiPut = <T>(path: string, body: any) => request<T>(path, { method: "PUT", body: JSON.stringify(body) });
export const apiPatch = <T>(path: string, body: any) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
export const apiDelete = <T>(path: string) => request<T>(path, { method: "DELETE" });

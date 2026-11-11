"use client";
import { apiUrl } from "@/lib/api-url";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { path: string; message: string }[]) { super(message); }
}

/** Endpoints that must never trigger a token refresh (avoids refresh loops). */
const NO_REFRESH = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);

let refreshing: Promise<boolean> | null = null;
async function refresh() {
  refreshing ??= fetch(apiUrl("/auth/refresh"), { method: "POST", headers: { "X-Requested-With": "XMLHttpRequest" }, credentials: "include" })
    .then((r) => r.ok)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

/** Admin API call: cookie auth, CSRF header, transparent token refresh. */
export async function adminFetch<T = any>(path: string, init: RequestInit & { json?: unknown } = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = { "X-Requested-With": "XMLHttpRequest", ...(init.headers as Record<string, string>) };
  let body = init.body;
  if (init.json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(init.json); }
  const res = await fetch(apiUrl(path), { ...init, headers, body, cache: "no-store", credentials: "include" });
  const canRefresh = !NO_REFRESH.has(path);
  if (res.status === 401 && retry && canRefresh) {
    if (await refresh()) return adminFetch<T>(path, init, false);
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError(401, "Session expired");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && !canRefresh) {
    throw new ApiError(401, data.error ?? (path === "/auth/login" ? "Invalid username or password" : "Session expired"), data.details);
  }
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Request failed", data.details);
  return data as T;
}

export function errorText(e: unknown) {
  if (e instanceof ApiError) return e.details?.length ? `${e.message}: ${e.details.map((d) => `${d.path || "field"} – ${d.message}`).join("; ")}` : e.message;
  return "Something went wrong";
}

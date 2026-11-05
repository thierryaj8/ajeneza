"use client";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: { path: string; message: string }[]) { super(message); }
}

let refreshing: Promise<boolean> | null = null;
async function refresh() {
  refreshing ??= fetch("/api/v1/auth/refresh", { method: "POST", headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then((r) => r.ok)
    .finally(() => setTimeout(() => (refreshing = null), 0));
  return refreshing;
}

/** Admin API call: same-origin, cookie auth, CSRF header, transparent token refresh. */
export async function adminFetch<T = any>(path: string, init: RequestInit & { json?: unknown } = {}, retry = true): Promise<T> {
  const headers: Record<string, string> = { "X-Requested-With": "XMLHttpRequest", ...(init.headers as Record<string, string>) };
  let body = init.body;
  if (init.json !== undefined) { headers["Content-Type"] = "application/json"; body = JSON.stringify(init.json); }
  const res = await fetch(`/api/v1${path}`, { ...init, headers, body, cache: "no-store" });
  if (res.status === 401 && retry && !path.startsWith("/auth/")) {
    if (await refresh()) return adminFetch<T>(path, init, false);
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new ApiError(401, "Session expired");
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Request failed", data.details);
  return data as T;
}

export function errorText(e: unknown) {
  if (e instanceof ApiError) return e.details?.length ? `${e.message}: ${e.details.map((d) => `${d.path || "field"} – ${d.message}`).join("; ")}` : e.message;
  return "Something went wrong";
}

import "server-only";
import type { Paged } from "./types";

/** The API lives on the same server; backend/src/server.ts sets API_URL to it. */
const API_URL = () => (process.env.API_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}`).replace(/\/$/, "");

/**
 * Server-side fetch from the public API.
 * Returns `fallback` when the API is unreachable, so pages degrade to empty states instead of crashing.
 */
export async function api<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_URL()}/api/v1${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const emptyPage = <T>(): Paged<T> => ({ items: [], total: 0, page: 1, pages: 0 });

export function list<T>(collection: string, params: Record<string, string | number | boolean | undefined> = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") qs.set(k, String(v));
  const s = qs.toString();
  return api<Paged<T>>(`/${collection}${s ? `?${s}` : ""}`, emptyPage<T>());
}

export const one = <T>(collection: string, slug: string, params = "") =>
  api<T | null>(`/${collection}/${encodeURIComponent(slug)}${params}`, null);

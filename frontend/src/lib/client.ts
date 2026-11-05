/** Browser-side helpers. Requests go through the same-origin /api/v1 proxy. */
export async function postJson(path: string, body: unknown): Promise<{ ok: true; data: any } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/v1${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.ok) return { ok: true, data };
    const detail = Array.isArray(data.details) ? data.details.map((d: { path: string; message: string }) => `${d.path}: ${d.message}`).join("; ") : "";
    return { ok: false, error: detail || data.error || "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Please try again." };
  }
}

"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminPage, Notice, useMe } from "./AdminShell";
import { adminFetch, errorText } from "./client";
import { STATUS_LABEL, STATUS_STYLE, type ResourceConfig } from "./config";
import { FieldInput, Label } from "./fields";

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status] ?? ""}`}>{STATUS_LABEL[status] ?? status}</span>;
}

export function ResourceList({ config }: { config: ResourceConfig }) {
  const [data, setData] = useState<{ items: any[]; total: number; page: number; pages: number } | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page: String(page), limit: "25", ...(q && { q }), ...(status && { status }), ...(config.preset as Record<string, string>) });
    adminFetch(`/admin/${config.api}?${qs}`).then(setData).catch((e) => setError(errorText(e)));
  }, [config, q, status, page]);
  useEffect(() => { const t = setTimeout(load, q ? 250 : 0); return () => clearTimeout(t); }, [load, q]);

  async function remove(item: any) {
    if (!confirm(`Delete “${item.title ?? item.name}”? This cannot be undone.`)) return;
    try { await adminFetch(`/admin/${config.api}/${item._id}`, { method: "DELETE" }); load(); } catch (e) { setError(errorText(e)); }
  }

  return (
    <AdminPage title={config.label} description={data ? `${data.total} ${data.total === 1 ? config.singular : `${config.singular}s`}` : undefined}
      actions={<Link href={`/admin/c/${config.key}/new`} className="btn-primary"><Plus size={16} /> New {config.singular}</Link>}>
      {error && <Notice kind="error" onClose={() => setError("")}>{error}</Notice>}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search" />
        </div>
        {config.publishable && (
          <select className="input w-auto" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} aria-label="Filter by status">
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        )}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted">
            <tr>
              {config.columns.map((c) => <th key={c.name} className="px-4 py-3 font-semibold">{c.label}</th>)}
              {config.publishable && <th className="px-4 py-3 font-semibold">Status</th>}
              <th className="px-4 py-3 text-right font-semibold"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {data?.items.map((item) => (
              <tr key={item._id} className="hover:bg-surface-2/50">
                {config.columns.map((c, i) => (
                  <td key={c.name} className="px-4 py-3">
                    {i === 0 ? (
                      <Link href={`/admin/c/${config.key}/${item._id}`} className="font-medium text-heading hover:text-accent">
                        {item[c.name]}{item.featured && <span className="ml-2 text-xs text-accent">★ Featured</span>}
                      </Link>
                    ) : c.format ? c.format(item[c.name], item) : String(item[c.name] ?? "–")}
                  </td>
                ))}
                {config.publishable && <td className="px-4 py-3"><StatusBadge status={item.status} /></td>}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {config.publicPath && item.status === "published" && (
                    <a href={config.publicPath(item)} target="_blank" className="inline-flex p-1.5 text-muted hover:text-accent" aria-label="View on site"><ExternalLink size={15} /></a>
                  )}
                  <Link href={`/admin/c/${config.key}/${item._id}`} className="inline-flex p-1.5 text-muted hover:text-accent" aria-label="Edit"><Pencil size={15} /></Link>
                  <button onClick={() => remove(item)} className="inline-flex p-1.5 text-muted hover:text-red-600" aria-label="Delete"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {data && !data.items.length && (
              <tr><td colSpan={config.columns.length + 2} className="px-4 py-12 text-center text-muted">Nothing here yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {data && data.pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span className="text-muted">Page {page} of {data.pages}</span>
          <button className="btn-secondary" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </AdminPage>
  );
}

const toLocalDateTime = (v?: string) => (v ? new Date(new Date(v).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

/** Strip server-managed fields and flatten populated references before sending. */
function toPayload(config: ResourceConfig, item: Record<string, any>) {
  const allowed = new Set([...config.fields.map((f) => f.name), "slug", "status", "publishAt", "featured", "seo", ...Object.keys(config.preset ?? {})]);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(item)) {
    if (!allowed.has(k)) continue;
    if (k === "category") out[k] = v && typeof v === "object" ? v._id : v || null;
    else if (Array.isArray(v) && ["tags", "projects"].includes(k)) out[k] = v.map((x) => (typeof x === "object" ? x._id : x));
    else if (Array.isArray(v) && v.every((x) => typeof x === "string")) out[k] = v.map((s) => s.trim()).filter(Boolean);
    else if (Array.isArray(v)) out[k] = v.map((row) => (row && typeof row === "object" ? Object.fromEntries(Object.entries(row).filter(([key]) => key !== "_id")) : row));
    else if (v === null && k !== "category" && !["coverImage", "logo"].includes(k)) continue;
    else out[k] = v;
  }
  return out;
}

export function ResourceEditor({ config, id }: { config: ResourceConfig; id?: string }) {
  const router = useRouter();
  const me = useMe();
  const [item, setItem] = useState<Record<string, any> | null>(id ? null : { status: "draft", featured: false, seo: {}, ...config.preset });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const canPublish = me?.role !== "content_manager";

  useEffect(() => {
    if (id) adminFetch(`/admin/${config.api}/${id}`).then(setItem).catch((e) => setMessage({ kind: "error", text: errorText(e) }));
  }, [config.api, id]);

  const set = (k: string, v: any) => setItem((prev) => ({ ...prev, [k]: v }));

  async function save(nextStatus?: string) {
    if (!item) return;
    setSaving(true); setMessage(null);
    const payload = toPayload(config, { ...item, ...(nextStatus ? { status: nextStatus } : {}) });
    if (payload.status !== "scheduled") delete payload.publishAt;
    try {
      const saved = id
        ? await adminFetch(`/admin/${config.api}/${id}`, { method: "PUT", json: payload })
        : await adminFetch(`/admin/${config.api}`, { method: "POST", json: payload });
     
      setItem(saved);
      setMessage({ kind: "success", text: saved.status === "in_review" && nextStatus === "published" ? "Submitted for review." : "Saved." });
      if (!id) router.replace(`/admin/c/${config.key}/${saved._id}`);
    } catch (e) {
      setMessage({ kind: "error", text: errorText(e) });
    } finally {
      setSaving(false);
    }
  }

  if (!item) return <AdminPage title="Loading…">{message && <Notice kind="error">{message.text}</Notice>}</AdminPage>;
  const title = item.title ?? item.name;

  return (
    <AdminPage title={id ? `Edit ${config.singular}` : `New ${config.singular}`} description={title}
      actions={<>
        <Link href={`/admin/c/${config.key}`} className="btn-ghost">Back to list</Link>
        {id && config.publicPath && item.status === "published" && <a href={config.publicPath(item)} target="_blank" className="btn-secondary"><ExternalLink size={14} /> View</a>}
      </>}>
      {message && <Notice kind={message.kind} onClose={() => setMessage(null)}>{message.text}</Notice>}
      <form className="grid gap-8 lg:grid-cols-[1fr_300px]" onSubmit={(e) => { e.preventDefault(); save(); }}>
        <div className="card grid gap-6 p-6 sm:grid-cols-2">
          {config.fields.map((f) => (
            <div key={f.name} className={f.wide || ["markdown", "objects", "images", "image"].includes(f.type) ? "sm:col-span-2" : ""}>
              <FieldInput field={f} value={item[f.name]} onChange={(v) => set(f.name, v)} />
            </div>
          ))}
        </div>
        <aside className="space-y-6">
          <div className="card space-y-4 p-5 lg:sticky lg:top-20">
            {config.publishable && (
              <>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select id="status" className="input" value={item.status} onChange={(e) => set("status", e.target.value)}>
                    {Object.entries(STATUS_LABEL).filter(([v]) => canPublish || !["published", "scheduled"].includes(v)).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                {item.status === "scheduled" && (
                  <div>
                    <Label htmlFor="publishAt" help="The item goes live automatically at this time.">Publish at</Label>
                    <input id="publishAt" type="datetime-local" className="input" value={toLocalDateTime(item.publishAt)} onChange={(e) => set("publishAt", e.target.value ? new Date(e.target.value).toISOString() : null)} required />
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!item.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured</label>
              </>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" className="btn-secondary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
              {config.publishable && item.status !== "published" && (
                <button type="button" className="btn-primary" disabled={saving} onClick={() => save(canPublish ? "published" : "in_review")}>
                  {canPublish ? "Publish now" : "Submit for review"}
                </button>
              )}
            </div>
            {item.updatedAt && <p className="text-xs text-muted">Last saved {new Date(item.updatedAt).toLocaleString()}</p>}
          </div>
          {config.publishable && (
            <details className="card p-5" open={!!(item.seo?.title || item.seo?.description)}>
              <summary className="cursor-pointer text-sm font-semibold text-heading">SEO & sharing</summary>
              <div className="mt-4 space-y-3">
                <div><Label htmlFor="slug" help="The address of this page. Leave as-is unless you need to change it.">URL slug</Label><input id="slug" className="input" value={item.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></div>
                <div><Label htmlFor="seo-title" help={`${(item.seo?.title ?? "").length}/60 recommended`}>Meta title</Label><input id="seo-title" className="input" value={item.seo?.title ?? ""} onChange={(e) => set("seo", { ...item.seo, title: e.target.value })} /></div>
                <div><Label htmlFor="seo-desc" help={`${(item.seo?.description ?? "").length}/160 recommended`}>Meta description</Label><textarea id="seo-desc" rows={3} className="input" value={item.seo?.description ?? ""} onChange={(e) => set("seo", { ...item.seo, description: e.target.value })} /></div>
                <div><Label htmlFor="seo-og">Social image URL</Label><input id="seo-og" className="input" value={item.seo?.ogImage ?? ""} onChange={(e) => set("seo", { ...item.seo, ogImage: e.target.value })} /></div>
                <div><Label htmlFor="seo-canon">Canonical URL</Label><input id="seo-canon" className="input" value={item.seo?.canonical ?? ""} onChange={(e) => set("seo", { ...item.seo, canonical: e.target.value })} /></div>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!item.seo?.noindex} onChange={(e) => set("seo", { ...item.seo, noindex: e.target.checked })} /> Hide from search engines</label>
              </div>
            </details>
          )}
        </aside>
      </form>
    </AdminPage>
  );
}

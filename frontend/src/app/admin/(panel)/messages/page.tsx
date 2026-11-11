"use client";
import { useCallback, useEffect, useState } from "react";
import { Archive, Mail, Reply, Trash2 } from "lucide-react";
import { AdminPage, Notice } from "@/components/admin/AdminShell";
import { adminFetch, errorText } from "@/components/admin/client";
import { INQUIRY_CATEGORIES } from "@/lib/site";

interface Msg { _id: string; name: string; email: string; organization?: string; subject: string; message: string; category: string; status: string; createdAt: string }
const STATUSES = ["new", "read", "replied", "archived", "spam"];

export default function MessagesPage() {
  const [items, setItems] = useState<Msg[]>([]);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<Msg | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(() => adminFetch(`/admin/messages?limit=100${status ? `&status=${status}` : ""}`).then((r) => setItems(r.items)).catch((e) => setError(errorText(e))), [status]);
  useEffect(() => { load(); }, [load]);

  async function mark(m: Msg, s: string) {
    try {
      const updated = await adminFetch<Msg>(`/admin/messages/${m._id}/status`, { method: "PATCH", json: { status: s } });
      setItems((list) => list.map((x) => (x._id === m._id ? updated : x)));
      setOpen((o) => (o?._id === m._id ? updated : o));
    } catch (e) {
      setError(errorText(e));
    }
  }
  async function remove(m: Msg) {
    if (!confirm("Delete this message?")) return;
    try { await adminFetch(`/admin/messages/${m._id}`, { method: "DELETE" }); setOpen(null); load(); } catch (e) { setError(errorText(e)); }
  }
  function view(m: Msg) { setOpen(m); if (m.status === "new") mark(m, "read"); }

  return (
    <AdminPage title="Messages" description="Inquiries from the contact form.">
      {error && <Notice kind="error" onClose={() => setError("")}>{error}</Notice>}
      <div className="mb-4 flex flex-wrap gap-2">
        {["", ...STATUSES].map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 text-sm capitalize ${status === s ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{s || "All"}</button>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <ul className="card divide-y divide-line overflow-hidden">
          {items.map((m) => (
            <li key={m._id}>
              <button onClick={() => view(m)} className={`block w-full px-4 py-3 text-left hover:bg-surface-2 ${open?._id === m._id ? "bg-surface-2" : ""}`}>
                <p className="flex items-center justify-between gap-2 text-sm"><span className={m.status === "new" ? "font-bold text-heading" : "text-heading"}>{m.name}</span><span className="text-xs text-muted">{new Date(m.createdAt).toLocaleDateString()}</span></p>
                <p className="truncate text-sm">{m.subject}</p>
                <p className="text-xs text-muted">{INQUIRY_CATEGORIES[m.category]} · <span className="capitalize">{m.status}</span></p>
              </button>
            </li>
          ))}
          {!items.length && <li className="p-8 text-center text-sm text-muted">No messages.</li>}
        </ul>
        {open ? (
          <article className="card p-6">
            <p className="eyebrow">{INQUIRY_CATEGORIES[open.category]}</p>
            <h2 className="mt-1 text-2xl font-bold">{open.subject}</h2>
            <p className="mt-2 text-sm text-muted">From <strong className="text-heading">{open.name}</strong> &lt;{open.email}&gt;{open.organization ? ` · ${open.organization}` : ""} · {new Date(open.createdAt).toLocaleString()}</p>
            <p className="mt-6 whitespace-pre-line leading-relaxed">{open.message}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <a href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject}`)}`} onClick={() => mark(open, "replied")} className="btn-primary"><Reply size={14} /> Reply by email</a>
              <button onClick={() => mark(open, "archived")} className="btn-secondary"><Archive size={14} /> Archive</button>
              <button onClick={() => mark(open, "spam")} className="btn-secondary">Mark spam</button>
              <button onClick={() => remove(open)} className="btn-ghost text-red-600"><Trash2 size={14} /> Delete</button>
            </div>
          </article>
        ) : <div className="card flex items-center justify-center p-10 text-muted"><Mail className="mr-2" size={18} /> Select a message</div>}
      </div>
    </AdminPage>
  );
}

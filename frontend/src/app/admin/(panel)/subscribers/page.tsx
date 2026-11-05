"use client";
import { useCallback, useEffect, useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { AdminPage, Notice } from "@/components/admin/AdminShell";
import { adminFetch, errorText } from "@/components/admin/client";

interface S { _id: string; email: string; name?: string; status: string; source?: string; createdAt: string }

export default function SubscribersPage() {
  const [data, setData] = useState<{ items: S[]; total: number } | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const load = useCallback(() => adminFetch(`/admin/subscribers?limit=200${q ? `&q=${encodeURIComponent(q)}` : ""}`).then(setData).catch((e) => setError(errorText(e))), [q]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  async function remove(s: S) {
    if (!confirm(`Remove ${s.email}?`)) return;
    try { await adminFetch(`/admin/subscribers/${s._id}`, { method: "DELETE" }); load(); } catch (e) { setError(errorText(e)); }
  }
  return (
    <AdminPage title="Newsletter" description={data ? `${data.total} subscribers` : undefined}
      actions={<a href="/api/v1/admin/subscribers/export" className="btn-secondary"><Download size={14} /> Export CSV</a>}>
      {error && <Notice kind="error" onClose={() => setError("")}>{error}</Notice>}
      <input className="input mb-4 max-w-xs" placeholder="Search email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search subscribers" />
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Subscribed</th><th /></tr></thead>
          <tbody className="divide-y divide-line">
            {data?.items.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-3 font-medium text-heading">{s.email}</td>
                <td className="px-4 py-3 capitalize">{s.status}</td>
                <td className="px-4 py-3 text-muted">{s.source ?? "–"}</td>
                <td className="px-4 py-3 text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(s)} aria-label={`Remove ${s.email}`} className="p-1.5 text-muted hover:text-red-600"><Trash2 size={15} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminPage>
  );
}

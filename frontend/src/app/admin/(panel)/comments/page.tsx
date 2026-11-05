"use client";
import { useCallback, useEffect, useState } from "react";
import { AdminPage, Notice } from "@/components/admin/AdminShell";
import { adminFetch, errorText } from "@/components/admin/client";

interface C { _id: string; name: string; email: string; body: string; status: string; createdAt: string; article?: { title: string; slug: string; section: string } }

export default function CommentsPage() {
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState<C[]>([]);
  const [error, setError] = useState("");
  const load = useCallback(() => adminFetch(`/admin/comments?limit=100&status=${status}`).then((r) => setItems(r.items)).catch((e) => setError(errorText(e))), [status]);
  useEffect(() => { load(); }, [load]);
  async function act(c: C, s: string | null) {
    try {
      if (s) await adminFetch(`/admin/comments/${c._id}/status`, { method: "PATCH", json: { status: s } });
      else await adminFetch(`/admin/comments/${c._id}`, { method: "DELETE" });
      load();
    } catch (e) { setError(errorText(e)); }
  }
  return (
    <AdminPage title="Comments" description="Reader comments are held for moderation before appearing.">
      {error && <Notice kind="error" onClose={() => setError("")}>{error}</Notice>}
      <div className="mb-4 flex gap-2">
        {["pending", "approved", "spam"].map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 text-sm capitalize ${status === s ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{s}</button>)}
      </div>
      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c._id} className="card p-5">
            <p className="text-sm"><strong className="text-heading">{c.name}</strong> <span className="text-muted">({c.email}) on</span> {c.article ? <a href={`/${c.article.section}/${c.article.slug}`} target="_blank" className="link">{c.article.title}</a> : "a deleted article"}</p>
            <p className="mt-2 whitespace-pre-line">{c.body}</p>
            <div className="mt-3 flex gap-2 text-sm">
              {c.status !== "approved" && <button onClick={() => act(c, "approved")} className="btn-primary px-3 py-1">Approve</button>}
              {c.status !== "spam" && <button onClick={() => act(c, "spam")} className="btn-secondary px-3 py-1">Spam</button>}
              {c.status === "approved" && <button onClick={() => act(c, "pending")} className="btn-secondary px-3 py-1">Unpublish</button>}
              <button onClick={() => confirm("Delete this comment?") && act(c, null)} className="btn-ghost px-3 py-1 text-red-600">Delete</button>
            </div>
          </li>
        ))}
        {!items.length && <li className="card p-10 text-center text-muted">Nothing to show.</li>}
      </ul>
    </AdminPage>
  );
}

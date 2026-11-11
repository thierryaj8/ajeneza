"use client";
import { apiUrl } from "@/lib/api-url";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { postJson } from "@/lib/client";
import { formatDate } from "@/lib/format";

interface C { _id: string; name: string; body: string; createdAt: string }

export function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<C[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch(apiUrl(`/articles/${slug}/comments`), { credentials: "include" }).then((r) => (r.ok ? r.json() : [])).then(setComments).catch(() => {});
  }, [slug]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSending(true); setError("");
    const res = await postJson(`/articles/${slug}/comments`, Object.fromEntries(new FormData(form)));
    setSending(false);
    if (res.ok) { setNotice(res.data.message ?? "Thanks! Your comment is awaiting moderation."); form.reset(); }
    else setError(res.error);
  }

  return (
    <section aria-labelledby="comments-title" className="mt-16 border-t border-line pt-10">
      <h2 id="comments-title" className="flex items-center gap-2 text-2xl"><MessageSquare size={20} /> Comments ({comments.length})</h2>
      <ul className="mt-6 space-y-6">
        {comments.map((c) => (
          <li key={c._id} className="border-l-2 border-line pl-4">
            <p className="text-sm font-semibold text-heading">{c.name} <span className="font-normal text-muted">· {formatDate(c.createdAt)}</span></p>
            <p className="mt-1 whitespace-pre-line text-ink">{c.body}</p>
          </li>
        ))}
      </ul>
      {notice ? (
        <p className="mt-8 rounded-xl bg-surface-2 p-4 text-sm" role="status">{notice}</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="c-name" className="label">Name</label><input id="c-name" name="name" required maxLength={80} className="input" /></div>
          <div><label htmlFor="c-email" className="label">Email <span className="font-normal text-muted">(not published)</span></label><input id="c-email" name="email" type="email" required className="input" /></div>
          <div className="sm:col-span-2"><label htmlFor="c-body" className="label">Comment</label><textarea id="c-body" name="body" required minLength={2} maxLength={3000} rows={4} className="input" /></div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          {error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{error}</p>}
          <div className="sm:col-span-2"><button className="btn-primary" disabled={sending}>{sending ? "Posting…" : "Post comment"}</button></div>
        </form>
      )}
    </section>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { FileText, Search, Upload, X } from "lucide-react";
import { adminFetch, errorText } from "./client";

export interface MediaItem { _id: string; name: string; url: string; kind: string; alt?: string; folder: string; size?: number; mimeType?: string; createdAt: string; provider: string }

export async function uploadFile(file: File, folder = "general", alt = "") {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  fd.append("alt", alt);
  return adminFetch<MediaItem>("/admin/media/upload", { method: "POST", body: fd });
}

/** Modal that lets the editor choose an existing file or upload a new one. */
export function MediaPicker({ onSelect, onClose, kind = "image" }: { onSelect: (m: MediaItem) => void; onClose: () => void; kind?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    adminFetch<{ items: MediaItem[] }>(`/admin/media?limit=60${kind ? `&kind=${kind}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`).then((r) => setItems(r.items)).catch((e) => setError(errorText(e)));
  }, [kind, q]);
  useEffect(load, [load]);

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError("");
    try { onSelect(await uploadFile(file)); } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal aria-label="Media library">
      <div className="card flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className="input pl-9" placeholder="Search media…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <label className="btn-primary cursor-pointer">
            <Upload size={16} /> {busy ? "Uploading…" : "Upload"}
            <input type="file" className="sr-only" accept={kind === "image" ? "image/jpeg,image/png,image/webp,image/gif,image/avif" : undefined} onChange={onUpload} disabled={busy} />
          </label>
          <button onClick={onClose} className="btn-ghost p-2" aria-label="Close"><X size={18} /></button>
        </div>
        {error && <p className="px-4 pt-3 text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-5">
          {items.map((m) => (
            <button key={m._id} type="button" onClick={() => onSelect(m)} className="group overflow-hidden rounded-xl border border-line text-left hover:border-accent">
              {m.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt || m.name} className="aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-surface-2"><FileText className="text-muted" /></div>
              )}
              <p className="truncate px-2 py-1.5 text-xs">{m.name}</p>
            </button>
          ))}
          {!items.length && <p className="col-span-full py-10 text-center text-sm text-muted">No media yet. Upload a file to get started.</p>}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useCallback, useEffect, useState } from "react";
import { Copy, FileText, Search, Trash2, Upload, Video } from "lucide-react";
import { AdminPage, Notice } from "@/components/admin/AdminShell";
import { adminFetch, errorText } from "@/components/admin/client";
import { uploadFile, type MediaItem } from "@/components/admin/MediaPicker";

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [filter, setFilter] = useState({ q: "", kind: "", folder: "" });
  const [folder, setFolder] = useState("general");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ limit: "100", ...Object.fromEntries(Object.entries(filter).filter(([, v]) => v)) });
    adminFetch(`/admin/media?${qs}`).then((r) => { setItems(r.items); setFolders(r.folders); }).catch((e) => setMsg({ kind: "error", text: errorText(e) }));
  }, [filter]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMsg(null);
    try { for (const f of Array.from(files)) await uploadFile(f, folder); setMsg({ kind: "success", text: `Uploaded ${files.length} file(s).` }); load(); }
    catch (e) { setMsg({ kind: "error", text: errorText(e) }); }
    finally { setBusy(false); }
  }
  async function addEmbed() {
    const url = prompt("YouTube or Vimeo URL");
    if (!url) return;
    try { await adminFetch("/admin/media/embed", { method: "POST", json: { url, name: prompt("Title for this video") || url } }); load(); }
    catch (e) { setMsg({ kind: "error", text: errorText(e) }); }
  }
  async function saveSelected() {
    if (!selected) return;
    try { const u = await adminFetch<MediaItem>(`/admin/media/${selected._id}`, { method: "PATCH", json: { name: selected.name, alt: selected.alt ?? "", folder: selected.folder } }); setSelected(u); load(); setMsg({ kind: "success", text: "Saved." }); }
    catch (e) { setMsg({ kind: "error", text: errorText(e) }); }
  }
  async function remove() {
    if (!selected || !confirm(`Delete ${selected.name}? Pages using it will show a broken image.`)) return;
    try { await adminFetch(`/admin/media/${selected._id}`, { method: "DELETE" }); setSelected(null); load(); }
    catch (e) { setMsg({ kind: "error", text: errorText(e) }); }
  }

  return (
    <AdminPage title="Media library" description="Images, PDFs and documents (up to 10 MB). Videos are added as YouTube or Vimeo embeds."
      actions={<>
        <input className="input w-36" value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Upload folder" placeholder="Folder" list="folders" />
        <datalist id="folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
        <label className="btn-primary cursor-pointer"><Upload size={16} /> {busy ? "Uploading…" : "Upload"}<input type="file" multiple className="sr-only" onChange={(e) => onFiles(e.target.files)} disabled={busy} /></label>
        <button className="btn-secondary" onClick={addEmbed}><Video size={16} /> Add video</button>
      </>}>
      {msg && <Notice kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Notice>}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative w-full max-w-xs"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className="input pl-9" placeholder="Search…" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} aria-label="Search media" /></div>
        <select className="input w-auto" value={filter.kind} onChange={(e) => setFilter({ ...filter, kind: e.target.value })} aria-label="Type"><option value="">All types</option><option value="image">Images</option><option value="pdf">PDFs</option><option value="document">Documents</option><option value="video">Videos</option></select>
        <select className="input w-auto" value={filter.folder} onChange={(e) => setFilter({ ...filter, folder: e.target.value })} aria-label="Folder"><option value="">All folders</option>{folders.map((f) => <option key={f}>{f}</option>)}</select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}>
          {items.map((m) => (
            <li key={m._id}>
              <button onClick={() => setSelected(m)} className={`w-full overflow-hidden rounded-xl border text-left ${selected?._id === m._id ? "border-accent ring-2 ring-accent/30" : "border-line"}`}>
                {m.kind === "image"
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={m.url} alt={m.alt || m.name} className="aspect-square w-full object-cover" loading="lazy" />
                  : <div className="flex aspect-square items-center justify-center bg-surface-2">{m.kind === "video" ? <Video className="text-muted" /> : <FileText className="text-muted" />}</div>}
                <p className="truncate px-2 py-1.5 text-xs">{m.name}</p>
              </button>
            </li>
          ))}
          {!items.length && <li className="col-span-full rounded-xl border border-dashed border-line p-16 text-center text-muted">Drop files here or use Upload.</li>}
        </ul>
        {selected && (
          <aside className="card h-fit space-y-3 p-5 lg:sticky lg:top-20">
            {selected.kind === "image" && /* eslint-disable-next-line @next/next/no-img-element */ <img src={selected.url} alt={selected.alt ?? ""} className="w-full rounded-lg" />}
            <div><label className="label" htmlFor="m-name">Name</label><input id="m-name" className="input" value={selected.name} onChange={(e) => setSelected({ ...selected, name: e.target.value })} /></div>
            <div><label className="label" htmlFor="m-alt">Alt text</label><input id="m-alt" className="input" value={selected.alt ?? ""} onChange={(e) => setSelected({ ...selected, alt: e.target.value })} /></div>
            <div><label className="label" htmlFor="m-folder">Folder</label><input id="m-folder" className="input" value={selected.folder} onChange={(e) => setSelected({ ...selected, folder: e.target.value })} /></div>
            <p className="break-all text-xs text-muted">{selected.mimeType ?? selected.kind}{selected.size ? ` · ${(selected.size / 1024).toFixed(0)} KB` : ""}</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-primary" onClick={saveSelected}>Save</button>
              <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(selected.url)}><Copy size={14} /> URL</button>
              <button className="btn-ghost text-red-600" onClick={remove}><Trash2 size={14} /></button>
            </div>
          </aside>
        )}
      </div>
    </AdminPage>
  );
}

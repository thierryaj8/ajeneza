"use client";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Markdown } from "@/components/content/Markdown";
import type { Field } from "./config";
import { adminFetch } from "./client";
import { MediaPicker } from "./MediaPicker";

type Img = { url: string; alt?: string };

export function Label({ htmlFor, children, help }: { htmlFor?: string; children: React.ReactNode; help?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-heading">{children}</label>
      {help && <p className="text-xs text-muted">{help}</p>}
    </div>
  );
}

export function MarkdownEditor({ id, value, onChange, rows = 16 }: { id: string; value: string; onChange: (v: string) => void; rows?: number }) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [picker, setPicker] = useState(false);
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-2 py-1.5 text-sm">
        <div className="flex gap-1">
          {(["write", "preview"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-md px-3 py-1 capitalize ${tab === t ? "bg-surface-2 font-semibold text-heading" : "text-muted"}`}>{t}</button>
          ))}
          <button type="button" onClick={() => setPicker(true)} className="flex items-center gap-1 rounded-md px-3 py-1 text-muted hover:text-accent"><ImagePlus size={14} /> Image</button>
        </div>
        <span className="text-xs text-muted">{words} words · ~{Math.max(1, Math.round(words / 220))} min · Markdown</span>
      </div>
      {tab === "write" ? (
        <textarea id={id} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="w-full resize-y bg-transparent p-4 font-mono text-sm leading-relaxed focus:outline-none" placeholder="Write in Markdown: ## Heading, **bold**, [link](https://…), > quote, - list" />
      ) : (
        <div className="min-h-[200px] p-4"><Markdown>{value || "_Nothing to preview._"}</Markdown></div>
      )}
      {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={(m) => { onChange(`${value}\n\n![${m.alt || m.name}](${m.url})\n`); setPicker(false); }} />}
    </div>
  );
}

function ImageField({ value, onChange }: { value?: Img | null; onChange: (v: Img | null) => void }) {
  const [picker, setPicker] = useState(false);
  return (
    <div className="flex flex-wrap items-start gap-4">
      {value?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value.url} alt={value.alt ?? ""} className="h-28 w-40 rounded-lg border border-line object-cover" />
      ) : (
        <div className="flex h-28 w-40 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted">No image</div>
      )}
      <div className="flex min-w-[220px] flex-1 flex-col gap-2">
        <input className="input" placeholder="Alternative text (describe the image)" value={value?.alt ?? ""} onChange={(e) => value && onChange({ ...value, alt: e.target.value })} disabled={!value} aria-label="Alternative text" />
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setPicker(true)}><ImagePlus size={14} /> Choose</button>
          {value && <button type="button" className="btn-ghost text-red-600" onClick={() => onChange(null)}>Remove</button>}
        </div>
      </div>
      {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={(m) => { onChange({ url: m.url, alt: m.alt || value?.alt || "" }); setPicker(false); }} />}
    </div>
  );
}

function ImagesField({ value = [], onChange }: { value?: Img[]; onChange: (v: Img[]) => void }) {
  const [picker, setPicker] = useState(false);
  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.url + i} className="rounded-lg border border-line p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.alt ?? ""} className="aspect-video w-full rounded object-cover" />
            <input className="input mt-2 px-2 py-1 text-xs" placeholder="Alt text" value={img.alt ?? ""} onChange={(e) => onChange(value.map((v, j) => (j === i ? { ...v, alt: e.target.value } : v)))} aria-label={`Alt text for image ${i + 1}`} />
            <div className="mt-1 flex justify-end gap-1">
              <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => { const n = [...value]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }} className="p-1 text-muted disabled:opacity-30"><ArrowUp size={14} /></button>
              <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))} className="p-1 text-red-600"><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className="btn-secondary mt-3" onClick={() => setPicker(true)}><ImagePlus size={14} /> Add image</button>
      {picker && <MediaPicker onClose={() => setPicker(false)} onSelect={(m) => { onChange([...value, { url: m.url, alt: m.alt ?? "" }]); setPicker(false); }} />}
    </div>
  );
}

function ObjectsField({ field, value = [], onChange }: { field: Extract<Field, { type: "objects" }>; value?: Record<string, string>[]; onChange: (v: Record<string, string>[]) => void }) {
  const set = (i: number, k: string, v: string) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: number) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };
  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2 rounded-xl border border-line p-3">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {field.fields.map((f) =>
              f.type === "textarea" ? (
                <textarea key={f.name} rows={3} className="input sm:col-span-2" placeholder={f.label} aria-label={f.label} value={row[f.name] ?? ""} onChange={(e) => set(i, f.name, e.target.value)} />
              ) : (
                <input key={f.name} type={f.type === "url" ? "url" : "text"} className="input" placeholder={f.label} aria-label={f.label} value={row[f.name] ?? ""} onChange={(e) => set(i, f.name, e.target.value)} />
              ),
            )}
          </div>
          <div className="flex flex-col gap-1">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-muted disabled:opacity-30"><ArrowUp size={14} /></button>
            <button type="button" aria-label="Move down" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="p-1 text-muted disabled:opacity-30"><ArrowDown size={14} /></button>
            <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="p-1 text-red-600"><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-secondary" onClick={() => onChange([...value, {}])}><Plus size={14} /> Add</button>
    </div>
  );
}

function useOptions(path: string) {
  const [opts, setOpts] = useState<{ _id: string; label: string }[]>([]);
  useEffect(() => {
    adminFetch<any>(path).then((r) => {
      const items = Array.isArray(r) ? r : r.items;
      setOpts(items.map((i: any) => ({ _id: i._id, label: i.name ?? i.title })));
    }).catch(() => {});
  }, [path]);
  return opts;
}

function CategoryField({ section, value, onChange, id }: { section: string; value?: any; onChange: (v: string) => void; id: string }) {
  const opts = useOptions(`/admin/categories?section=${section}&limit=100`);
  const current = typeof value === "object" && value ? value._id : value ?? "";
  return (
    <select id={id} className="input" value={current} onChange={(e) => onChange(e.target.value)}>
      <option value="">— None —</option>
      {opts.map((o) => <option key={o._id} value={o._id}>{o.label}</option>)}
    </select>
  );
}

function RefsField({ resource, value = [], onChange }: { resource: string; value?: any[]; onChange: (v: string[]) => void }) {
  const opts = useOptions(`/admin/${resource}?limit=100`);
  const ids = value.map((v) => (typeof v === "object" ? v._id : v));
  return (
    <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-xl border border-line p-3">
      {opts.map((o) => {
        const on = ids.includes(o._id);
        return (
          <button key={o._id} type="button" aria-pressed={on} onClick={() => onChange(on ? ids.filter((i) => i !== o._id) : [...ids, o._id])}
            className={`rounded-full border px-3 py-1 text-xs ${on ? "border-accent bg-accent text-accent-ink" : "border-line"}`}>{o.label}</button>
        );
      })}
      {!opts.length && <span className="text-xs text-muted">Nothing to choose from yet.</span>}
    </div>
  );
}

const toDateInput = (v?: string) => (v ? String(v).slice(0, 10) : "");

export function FieldInput({ field, value, onChange }: { field: Field; value: any; onChange: (v: any) => void }) {
  const id = `f-${field.name}`;
  let input: React.ReactNode;
  switch (field.type) {
    case "text": case "url":
      input = <input id={id} type={field.type === "url" ? "url" : "text"} className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} required={"required" in field && field.required} />; break;
    case "number":
      input = <input id={id} type="number" className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))} />; break;
    case "date":
      input = <input id={id} type="date" className="input" value={toDateInput(value)} onChange={(e) => onChange(e.target.value || null)} required={"required" in field && field.required} />; break;
    case "textarea":
      input = <textarea id={id} rows={4} className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />; break;
    case "markdown":
      input = <MarkdownEditor id={id} value={value ?? ""} onChange={onChange} />; break;
    case "select":
      input = (
        <select id={id} className="input" value={value ?? Object.keys(field.options)[0]} onChange={(e) => onChange(e.target.value)}>
          {Object.entries(field.options).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      ); break;
    case "checkboxes": {
      const arr: string[] = value ?? [];
      input = (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {Object.entries(field.options).map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={arr.includes(v)} onChange={(e) => onChange(e.target.checked ? [...arr, v] : arr.filter((x) => x !== v))} /> {l}</label>
          ))}
        </div>
      ); break;
    }
    case "boolean":
      return <label className="flex items-center gap-2 text-sm font-medium text-heading"><input type="checkbox" checked={value !== false} onChange={(e) => onChange(e.target.checked)} /> {field.label}</label>;
    case "list":
      input = <textarea id={id} rows={5} className="input" value={(value ?? []).join("\n")} onChange={(e) => onChange(e.target.value.split("\n"))} onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))} />; break;
    case "image": input = <ImageField value={value} onChange={onChange} />; break;
    case "images": input = <ImagesField value={value} onChange={onChange} />; break;
    case "objects": input = <ObjectsField field={field} value={value} onChange={onChange} />; break;
    case "category": input = <CategoryField id={id} section={field.section} value={value} onChange={onChange} />; break;
    case "refs": input = <RefsField resource={field.resource} value={value} onChange={onChange} />; break;
  }
  return (
    <div>
      <Label htmlFor={id} help={field.help}>{field.label}{"required" in field && field.required && <span className="text-red-600"> *</span>}</Label>
      {input}
    </div>
  );
}

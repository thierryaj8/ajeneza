"use client";
import { useEffect, useState } from "react";
import { AdminPage, Notice } from "./AdminShell";
import { adminFetch, errorText } from "./client";
import type { Field } from "./config";
import { FieldInput } from "./fields";

/** Edits a singleton document (profile, settings). Field names may be dotted, e.g. "now.building". */
export interface Transform { load: (doc: any) => any; save: (payload: any) => any }

export function SingletonForm({ title, description, path, sections, transform }: { title: string; description?: string; path: string; sections: { title: string; fields: Field[] }[]; transform?: Transform }) {
  const [doc, setDoc] = useState<Record<string, any> | null>(null);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => { adminFetch(path).then((d) => setDoc(transform ? transform.load(d) : d)).catch((e) => setMsg({ kind: "error", text: errorText(e) })); }, [path]);

  const get = (name: string) => name.split(".").reduce<any>((o, k) => o?.[k], doc);
  const set = (name: string, v: any) => setDoc((prev) => {
    const copy = structuredClone(prev ?? {});
    const keys = name.split(".");
    let o = copy;
    for (const k of keys.slice(0, -1)) o = o[k] ??= {};
    o[keys.at(-1)!] = v;
    return copy;
  });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const payload: Record<string, any> = {};
    for (const s of sections) for (const f of s.fields) {
      const top = f.name.split(".")[0];
      let v = doc?.[top];
      if (Array.isArray(v)) v = v.map((x) => (typeof x === "string" ? x.trim() : x && typeof x === "object" ? Object.fromEntries(Object.entries(x).filter(([k]) => k !== "_id")) : x)).filter((x) => x !== "");
      if (v && typeof v === "object" && !Array.isArray(v)) v = Object.fromEntries(Object.entries(v).filter(([k]) => k !== "_id" && k !== "updatedAt"));
      if (v !== undefined && v !== null) payload[top] = v;
    }
    try { const saved = await adminFetch(path, { method: "PUT", json: transform ? transform.save(payload) : payload }); setDoc(transform ? transform.load(saved) : saved); setMsg({ kind: "success", text: "Saved. The website will show the changes right away." }); }
    catch (err) { setMsg({ kind: "error", text: errorText(err) }); }
    finally { setSaving(false); }
  }

  if (!doc) return <AdminPage title={title}>{msg ? <Notice kind="error">{msg.text}</Notice> : <p className="text-muted">Loading…</p>}</AdminPage>;
  return (
    <AdminPage title={title} description={description}>
      {msg && <Notice kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Notice>}
      <form onSubmit={save} className="space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="card p-6">
            <h2 className="mb-5 text-xl font-bold">{s.title}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {s.fields.map((f) => (
                <div key={f.name} className={f.wide || ["markdown", "objects", "image", "images"].includes(f.type) ? "sm:col-span-2" : ""}>
                  <FieldInput field={f} value={get(f.name)} onChange={(v) => set(f.name, v)} />
                </div>
              ))}
            </div>
          </section>
        ))}
        <div className="sticky bottom-4 flex justify-end"><button className="btn-primary shadow-lg" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button></div>
      </form>
    </AdminPage>
  );
}

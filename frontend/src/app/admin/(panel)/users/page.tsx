"use client";
import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminPage, Notice, useMe } from "@/components/admin/AdminShell";
import { adminFetch, errorText } from "@/components/admin/client";

interface U { _id: string; name: string; email: string; role: string; lastLoginAt?: string }
const ROLES: Record<string, string> = { superadmin: "Super administrator", editor: "Editor (can publish)", content_manager: "Content manager (drafts & review)" };

export default function UsersPage() {
  const me = useMe();
  const [users, setUsers] = useState<U[]>([]);
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const load = useCallback(() => adminFetch<U[]>("/admin/users").then(setUsers).catch((e) => setMsg({ kind: "error", text: errorText(e) })), []);
  useEffect(() => { load(); }, [load]);
  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    try { await adminFetch("/admin/users", { method: "POST", json: Object.fromEntries(new FormData(form)) }); form.reset(); setMsg({ kind: "success", text: "User created." }); load(); }
    catch (err) { setMsg({ kind: "error", text: errorText(err) }); }
  }
  async function remove(u: U) {
    if (!confirm(`Delete ${u.email}?`)) return;
    try { await adminFetch(`/admin/users/${u._id}`, { method: "DELETE" }); load(); } catch (err) { setMsg({ kind: "error", text: errorText(err) }); }
  }
  return (
    <AdminPage title="Users" description="Administrators, editors and content managers.">
      {msg && <Notice kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Notice>}
      <ul className="card mb-8 divide-y divide-line">
        {users.map((u) => (
          <li key={u._id} className="flex items-center justify-between gap-4 p-4">
            <div><p className="font-medium text-heading">{u.name} <span className="text-sm font-normal text-muted">{u.email}</span></p><p className="text-xs text-muted">{ROLES[u.role]}{u.lastLoginAt ? ` · last sign-in ${new Date(u.lastLoginAt).toLocaleString()}` : ""}</p></div>
            {u._id !== me?.id && <button onClick={() => remove(u)} className="p-2 text-muted hover:text-red-600" aria-label={`Delete ${u.email}`}><Trash2 size={16} /></button>}
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="card grid gap-4 p-6 sm:grid-cols-2">
        <h2 className="text-xl font-bold sm:col-span-2">Add a user</h2>
        <div><label className="label" htmlFor="u-name">Name</label><input id="u-name" name="name" required className="input" /></div>
        <div><label className="label" htmlFor="u-email">Email</label><input id="u-email" name="email" type="email" required className="input" /></div>
        <div><label className="label" htmlFor="u-pass">Temporary password (12+ characters)</label><input id="u-pass" name="password" type="password" minLength={12} required className="input" autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="u-role">Role</label><select id="u-role" name="role" className="input" defaultValue="editor">{Object.entries(ROLES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
        <div className="sm:col-span-2"><button className="btn-primary">Create user</button></div>
      </form>
    </AdminPage>
  );
}

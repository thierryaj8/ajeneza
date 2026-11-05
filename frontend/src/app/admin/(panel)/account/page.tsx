"use client";
import { useState } from "react";
import { AdminPage, Notice, useMe } from "@/components/admin/AdminShell";
import { adminFetch, errorText } from "@/components/admin/client";

export default function AccountPage() {
  const me = useMe();
  const [msg, setMsg] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("newPassword") !== f.get("confirm")) return setMsg({ kind: "error", text: "The new passwords do not match." });
    try { await adminFetch("/auth/password", { method: "PUT", json: { currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") } }); form.reset(); setMsg({ kind: "success", text: "Password changed. Other sessions have been signed out." }); }
    catch (err) { setMsg({ kind: "error", text: errorText(err) }); }
  }
  return (
    <AdminPage title="My account" description={`${me?.name} · ${me?.email}`}>
      {msg && <Notice kind={msg.kind} onClose={() => setMsg(null)}>{msg.text}</Notice>}
      <form onSubmit={onSubmit} className="card max-w-md space-y-4 p-6">
        <h2 className="text-xl font-bold">Change password</h2>
        <div><label className="label" htmlFor="cur">Current password</label><input id="cur" name="currentPassword" type="password" required className="input" autoComplete="current-password" /></div>
        <div><label className="label" htmlFor="np">New password (12+ characters)</label><input id="np" name="newPassword" type="password" minLength={12} required className="input" autoComplete="new-password" /></div>
        <div><label className="label" htmlFor="cf">Confirm new password</label><input id="cf" name="confirm" type="password" minLength={12} required className="input" autoComplete="new-password" /></div>
        <button className="btn-primary">Update password</button>
      </form>
    </AdminPage>
  );
}

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock } from "lucide-react";
import { adminFetch, errorText } from "@/components/admin/client";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true); setError("");
    try {
      await adminFetch("/auth/login", { method: "POST", json: { email: form.get("email"), password: form.get("password") } });
      router.replace(next?.startsWith("/admin") ? next : "/admin");
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card w-full max-w-sm space-y-5 p-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy text-white"><Lock size={20} /></span>
        <h1 className="mt-4 text-2xl font-bold">Admin sign in</h1>
        <p className="text-sm text-muted">AJENEZA M. Thierry CMS</p>
      </div>
      <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required autoComplete="username" className="input" /></div>
      <div><label htmlFor="password" className="label">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button className="btn-primary w-full" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <Suspense><LoginForm /></Suspense>
    </main>
  );
}

"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { postJson } from "@/lib/client";

/** Newsletter signup. `band` = the gold full-width band; `inline` = on light backgrounds. */
export function NewsletterForm({ source = "website", variant = "inline" }: { source?: string; variant?: "band" | "inline" }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    const res = await postJson("/newsletter/subscribe", { email: form.get("email"), website: form.get("website") || "", source });
    if (res.ok) setState("done");
    else { setState("error"); setError(res.error); }
  }

  const band = variant === "band";
  if (state === "done") {
    return <p className={`flex items-center gap-2 text-sm ${band ? "text-cream" : "text-heading"}`} role="status"><Check size={16} /> Thank you. You&apos;re subscribed.</p>;
  }
  return (
    <form onSubmit={onSubmit} className={band ? "w-full md:w-[410px]" : "mt-4 w-full"}>
      <div className="flex">
        <label htmlFor={`nl-${source}`} className="sr-only">Email address</label>
        <input id={`nl-${source}`} name="email" type="email" required autoComplete="email" placeholder="Your email address"
          className={band
            ? "min-w-0 flex-1 border border-white/60 bg-white/10 px-3 py-3 text-sm text-white placeholder:text-gold-100 focus:outline-none focus:ring-2 focus:ring-white/40"
            : "input flex-1"} />
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button type="submit" disabled={state === "sending"} className="shrink-0 border border-navy bg-navy px-4 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-60">
          {state === "sending" ? "…" : "Subscribe"}
        </button>
      </div>
      {state === "error" && <p className={`mt-2 text-sm ${band ? "text-white" : "text-red-700"}`} role="alert">{error}</p>}
    </form>
  );
}

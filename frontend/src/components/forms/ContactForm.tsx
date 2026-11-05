"use client";
import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { postJson } from "@/lib/client";
import { INQUIRY_CATEGORIES } from "@/lib/site";

export function ContactForm({ defaultCategory = "general" }: { defaultCategory?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await postJson("/contact", Object.fromEntries(new FormData(e.currentTarget)));
    if (res.ok) setState("done");
    else { setState("idle"); setError(res.error); }
  }

  if (state === "done") {
    return (
      <div className="card flex flex-col items-center p-10 text-center" role="status">
        <CheckCircle2 className="text-accent" size={36} />
        <p className="mt-4 font-serif text-2xl font-semibold text-heading">Message sent</p>
        <p className="mt-2 text-muted">Thank you for reaching out. I&apos;ll reply as soon as I can.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8" noValidate={false}>
      <div>
        <label htmlFor="name" className="label">Full name</label>
        <input id="name" name="name" required maxLength={120} autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="organization" className="label">Organization <span className="font-normal text-muted">(optional)</span></label>
        <input id="organization" name="organization" maxLength={200} autoComplete="organization" className="input" />
      </div>
      <div>
        <label htmlFor="category" className="label">Inquiry category</label>
        <select id="category" name="category" defaultValue={defaultCategory} className="input">
          {Object.entries(INQUIRY_CATEGORIES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="subject" className="label">Subject</label>
        <input id="subject" name="subject" required maxLength={200} className="input" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" required minLength={10} maxLength={5000} rows={6} className="input" />
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{error}</p>}
      <div className="flex items-center justify-between gap-4 sm:col-span-2">
        <p className="text-xs text-muted">Your details are only used to reply to you.</p>
        <button type="submit" className="btn-primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : <>Send message <Send size={15} /></>}
        </button>
      </div>
    </form>
  );
}

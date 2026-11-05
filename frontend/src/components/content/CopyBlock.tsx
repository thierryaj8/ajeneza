"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="card relative p-6 pr-14">
      <p className="leading-relaxed">{text}</p>
      <button type="button" aria-label="Copy biography" className="absolute right-3 top-3 rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-accent"
        onClick={() => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}>
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

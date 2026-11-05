"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Article, Category } from "@/lib/types";

const initial = (s: string) => s.replace(/^\[[^\]]*\]\s*/, "").charAt(0).toUpperCase() || "J";

/** Journal cards with instant search and topic filters (template section 08). */
export function JournalGrid({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  const [active, setActive] = useState("all");
  const [term, setTerm] = useState("");
  const shown = useMemo(() => articles.filter((a) => {
    const catOk = active === "all" || a.category?.slug === active;
    const t = term.trim().toLowerCase();
    return catOk && (!t || `${a.title} ${a.excerpt ?? ""} ${a.category?.name ?? ""}`.toLowerCase().includes(t));
  }), [articles, active, term]);
  const topics = categories.filter((c) => articles.some((a) => a.category?.slug === c.slug));

  return (
    <>
      <div className="-mt-3 mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by topic">
          {[{ slug: "all", name: "All topics" }, ...topics].map((c) => (
            <button key={c.slug} type="button" onClick={() => setActive(c.slug)} aria-pressed={active === c.slug}
              className={`border px-3.5 py-2 text-[10px] uppercase tracking-[0.1em] transition-colors ${active === c.slug ? "border-navy bg-navy text-cream dark:border-gold-300 dark:bg-gold-300 dark:text-navy" : "border-line text-muted hover:border-navy hover:bg-navy hover:text-cream"}`}>
              {c.name}
            </button>
          ))}
        </div>
        <label className="w-full md:w-56">
          <span className="sr-only">Search the journal</span>
          <input type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search the journal…" className="input text-xs" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => (
          <article key={a._id} className="border border-line bg-surface">
            <div aria-hidden className="relative grid h-[145px] place-items-center overflow-hidden bg-[#ded5c7] font-serif text-[49px] italic text-[#34434a] dark:bg-surface-2 dark:text-gold-300">
              <span className="absolute h-[110px] w-[110px] rounded-full border border-navy/25 dark:border-gold-300/30" />
              {initial(a.category?.name ?? a.title)}.
            </div>
            <div className="p-5">
              <p className="eyebrow">{a.category?.name ?? "Journal"} · {a.readingTime} min read</p>
              <h3 className="my-2.5 text-[22px] leading-snug"><Link href={`/${a.section}/${a.slug}`} className="hover:text-accent">{a.title}</Link></h3>
              {a.excerpt && <p className="mb-4 text-xs leading-relaxed text-muted">{a.excerpt}</p>}
              <Link href={`/${a.section}/${a.slug}`} className="text-link">Read article ↗</Link>
            </div>
          </article>
        ))}
        {!shown.length && <p className="col-span-full border border-dashed border-line p-6 text-center text-sm text-muted">No articles match your search. Try another phrase or topic.</p>}
      </div>
    </>
  );
}

"use client";
import Link from "next/link";
import { useState } from "react";
import { PROJECT_CATEGORIES } from "@/lib/site";
import type { Project } from "@/lib/types";

/** The template's "All work / Software / AI & data / Research" filter, mapped onto project categories. */
const GROUPS: Record<string, { label: string; cats: string[] }> = {
  all: { label: "All work", cats: [] },
  software: { label: "Software", cats: ["web", "mobile", "cloud", "devops", "open_source"] },
  ai: { label: "AI & data", cats: ["ai", "ml"] },
  research: { label: "Research", cats: ["research"] },
};

export function ProjectFilterGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("all");
  const shown = active === "all" ? projects : projects.filter((p) => p.categories?.some((c) => GROUPS[active].cats.includes(c)));
  return (
    <>
      <div className="-mt-3 mb-7 flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {Object.entries(GROUPS).map(([key, g]) => (
          <button key={key} type="button" onClick={() => setActive(key)} aria-pressed={active === key}
            className={`border px-3.5 py-2 text-[10px] uppercase tracking-[0.1em] transition-colors ${active === key ? "border-navy bg-navy text-cream dark:border-gold-300 dark:bg-gold-300 dark:text-navy" : "border-line text-muted hover:border-navy hover:bg-navy hover:text-cream"}`}>
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <article key={p._id} className="group relative flex min-h-[235px] flex-col border border-line bg-surface p-6">
            <div className="flex justify-between text-[10px] uppercase tracking-[0.12em] text-accent">
              <span>{PROJECT_CATEGORIES[p.categories?.[0] ?? ""] ?? "Project"}</span><span>{String(i + 1).padStart(2, "0")}</span>
            </div>
            <h3 className="mb-2 mt-7 text-[25px]"><Link href={`/projects/${p.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">{p.title}</Link></h3>
            <p className="mb-5 text-[13px] leading-relaxed text-muted">{p.summary}</p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              {p.technologies?.slice(0, 4).map((t) => <span key={t} className="border border-line px-2 py-1 text-[10px] tracking-[0.06em] text-muted">{t}</span>)}
            </div>
          </article>
        ))}
        {!shown.length && <p className="col-span-full border border-dashed border-line p-6 text-center text-sm text-muted">No projects in this category yet.</p>}
      </div>
    </>
  );
}

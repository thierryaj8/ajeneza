import Link from "next/link";
import { EmptyState } from "@/components/ui";
import type { Article } from "@/lib/types";
import { SectionHead } from "./SectionHead";

const initial = (s: string) => s.replace(/^\[[^\]]*\]\s*/, "").charAt(0).toUpperCase() || "J";

export function WritingSection({ articles }: { articles: Article[] }) {
  const [lead, ...rest] = articles;
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead index="03" eyebrow="Selected writing" title="Reporting, reflection & perspective." intro="Journalism and commentary that make room for context, evidence and a diversity of perspectives." href="/journalism" linkLabel="All journalism" />
        {!lead ? <EmptyState /> : (
          <div className="grid gap-7 lg:grid-cols-[1.25fr_.75fr]">
            <article className="grid border border-line bg-surface md:grid-cols-[.9fr_1.1fr]">
              <div aria-hidden className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[#d9d0c0] dark:bg-surface-2">
                <span className="absolute h-[250px] w-[250px] rounded-full border border-navy/30 dark:border-gold-300/30" />
                <span className="absolute h-[175px] w-[175px] rounded-full border border-navy/30 dark:border-gold-300/30" />
                <span className="relative font-serif text-[65px] italic text-navy dark:text-gold-300">{initial(lead.title)}.</span>
              </div>
              <div className="flex flex-col items-start p-8">
                <p className="eyebrow">Featured · {lead.category?.name ?? "Journalism"}</p>
                <h3 className="mb-3 mt-4 text-[29px] leading-tight"><Link href={`/${lead.section}/${lead.slug}`} className="hover:text-accent">{lead.title}</Link></h3>
                <p className="mb-5 text-[13px] leading-loose text-muted">{lead.excerpt || lead.subtitle}</p>
                <Link href={`/${lead.section}/${lead.slug}`} className="text-link mt-auto">Read the article ↗</Link>
              </div>
            </article>
            <div className="grid content-start gap-3">
              {rest.slice(0, 3).map((a) => (
                <article key={a._id} className="border-b border-line pb-4 pt-2">
                  <p className="eyebrow">{a.category?.name ?? "Journalism"}</p>
                  <h3 className="my-2 text-[21px] leading-snug"><Link href={`/${a.section}/${a.slug}`} className="hover:text-accent">{a.title}</Link></h3>
                  {(a.excerpt || a.subtitle) && <p className="text-xs text-muted">{a.excerpt || a.subtitle}</p>}
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

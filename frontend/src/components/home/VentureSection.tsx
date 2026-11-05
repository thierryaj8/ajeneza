import Link from "next/link";
import type { Venture } from "@/lib/types";

export function VentureSection({ venture }: { venture?: Venture }) {
  if (!venture) return null;
  const [first, ...restName] = venture.title.split(" ");
  return (
    <section id="ventures" className="section bg-sand dark:bg-surface-2">
      <div className="wrap grid items-center gap-10 md:grid-cols-[.85fr_1.15fr] md:gap-[70px]">
        <div className="relative grid min-h-[250px] place-items-center overflow-hidden bg-navy text-[#f3eadb] md:min-h-[330px]">
          <span aria-hidden className="absolute inset-6 border border-gold-300/55" />
          <strong className="z-[1] font-serif text-6xl font-normal tracking-[-0.07em]">{first}</strong>
          <small className="absolute bottom-11 z-[1] text-[9px] uppercase tracking-[0.25em] text-gold-300">{restName.join(" ")}</small>
        </div>
        <div>
          <p className="eyebrow">05 / Entrepreneurship & ventures</p>
          <h2 className="mb-4 mt-2 text-4xl leading-tight sm:text-[43px]">Building technology with purpose.</h2>
          <p className="my-3 inline-flex border-y border-[#cfc4b4] py-3 font-serif text-[17px] italic text-[#34434a] dark:border-line dark:text-ink">{venture.role} · {venture.title}</p>
          <p className="text-sm leading-loose text-muted">{venture.summary}</p>
          {!!venture.services?.length && (
            <div className="my-5 flex flex-wrap gap-2">
              {venture.services.slice(0, 6).map((s) => <span key={s.title} className="border border-[#cfc4b4] px-2.5 py-1.5 text-[11px] text-muted dark:border-line">{s.title}</span>)}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-5">
            {venture.website && <a href={venture.website} target="_blank" rel="noopener noreferrer" className="btn-primary">Discover {first} ↗</a>}
            <Link href={`/ventures/${venture.slug}`} className="text-link">About the company ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

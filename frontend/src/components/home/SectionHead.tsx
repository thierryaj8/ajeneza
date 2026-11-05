import Link from "next/link";

/** "01 / Eyebrow" + serif title on the left, short description (or actions) on the right. */
export function SectionHead({ index, eyebrow, title, intro, href, linkLabel, dark = false, children }: {
  index?: string; eyebrow: string; title: string; intro?: string; href?: string; linkLabel?: string; dark?: boolean; children?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end md:gap-8">
      <div>
        <p className={dark ? "text-[11px] font-bold uppercase tracking-[0.22em] text-gold-300" : "eyebrow"}>{index ? `${index} / ` : ""}{eyebrow}</p>
        <h2 className={`section-title ${dark ? "text-cream" : ""}`}>{title}</h2>
      </div>
      <div className="flex flex-col items-start gap-3 md:items-end">
        {intro && <p className={`max-w-[400px] text-[13px] md:text-right ${dark ? "text-silver" : "text-muted"}`}>{intro}</p>}
        {href && <Link href={href} className={dark ? "border-b border-gold-300/60 pb-1 text-[11px] uppercase tracking-[0.13em] text-gold-300" : "text-link"}>{linkLabel ?? "View all"} ↗</Link>}
        {children}
      </div>
    </div>
  );
}

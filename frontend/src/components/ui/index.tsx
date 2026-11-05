import Link from "next/link";
import { Inbox } from "lucide-react";

/** Navy band at the top of inner pages, matching the homepage hero. */
export function PageHeader({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-navy text-cream">
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-48 h-[420px] w-[420px] rounded-full border border-gold-300/15 shadow-[0_0_0_45px_rgba(214,185,142,.035)]" />
      <div className="wrap relative py-14 sm:py-20">
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-300">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl font-serif text-4xl leading-[1.05] tracking-[-0.035em] text-cream sm:text-5xl lg:text-6xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-[15px] leading-[1.9] text-silver-200">{intro}</p>}
        {children && <div className="[&_.input]:border-white/30 [&_.input]:bg-white/10 [&_.input]:text-cream [&_.input]:placeholder:text-silver">{children}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({ eyebrow, title, href, linkLabel = "View all" }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
      </div>
      {href && <Link href={href} className="text-link">{linkLabel} ↗</Link>}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", message = "New content will appear here once it is published." }: { title?: string; message?: string }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-line px-6 py-14 text-center">
      <Inbox className="text-muted" size={26} strokeWidth={1.25} />
      <p className="mt-4 font-serif text-xl text-heading">{title}</p>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
    </div>
  );
}

export function FilterBar({ items, active, basePath, param = "category", allLabel = "All", extra = {} }: {
  items: { label: string; value: string }[]; active?: string; basePath: string; param?: string; allLabel?: string; extra?: Record<string, string | undefined>;
}) {
  const href = (value?: string) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(extra)) if (v) qs.set(k, v);
    if (value) qs.set(param, value);
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const cls = (on: boolean) =>
    `whitespace-nowrap border px-3.5 py-2 text-[10px] uppercase tracking-[0.1em] transition-colors ${on ? "border-navy bg-navy text-cream dark:border-gold-300 dark:bg-gold-300 dark:text-navy" : "border-line text-muted hover:border-navy hover:bg-navy hover:text-cream"}`;
  return (
    <nav aria-label="Filter" className="-mx-4 overflow-x-auto px-4 pb-1">
      <ul className="flex gap-2">
        <li><Link href={href()} className={cls(!active)} aria-current={!active ? "true" : undefined}>{allLabel}</Link></li>
        {items.map((i) => (
          <li key={i.value}><Link href={href(i.value)} className={cls(active === i.value)} aria-current={active === i.value ? "true" : undefined}>{i.label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

export function Pagination({ page, pages, basePath, params = {} }: { page: number; pages: number; basePath: string; params?: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
      {page > 1 && <Link href={href(page - 1)} className="btn-secondary" rel="prev">Previous</Link>}
      <span className="px-3 text-sm text-muted">Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} className="btn-secondary" rel="next">Next</Link>}
    </nav>
  );
}

export function SearchInput({ action, defaultValue, placeholder = "Search…", hidden = {} }: { action: string; defaultValue?: string; placeholder?: string; hidden?: Record<string, string | undefined> }) {
  return (
    <form action={action} role="search" className="relative w-full max-w-sm">
      {Object.entries(hidden).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label htmlFor={`search-${action}`} className="sr-only">Search</label>
      <input id={`search-${action}`} name="q" defaultValue={defaultValue} placeholder={placeholder} className="input" type="search" />
    </form>
  );
}

import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { list } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import type { Venture } from "@/lib/types";

export const metadata = pageMeta({ title: "Ventures & Entrepreneurship", path: "/ventures", description: "OrLabs Tech Industries and other ventures co-founded by AJENEZA M. Thierry." });

export default async function VenturesPage() {
  const ventures = await list<Venture>("ventures", { limit: 50 });
  const [featured, ...others] = ventures.items;
  return (
    <>
      <PageHeader eyebrow="Entrepreneurship" title="Ventures and initiatives" intro="Companies, startups and initiatives I have founded or contribute to." />
      <div className="container space-y-12 py-14">
        {!featured && <EmptyState />}
        {featured && (
          <Link href={`/ventures/${featured.slug}`} className="group relative block overflow-hidden  bg-navy p-8 text-white sm:p-14">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-gold-300/20 shadow-[0_0_0_40px_rgba(214,185,142,.04)]" />
            <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Featured venture · {featured.role}</p>
            <h2 className="relative mt-3 text-4xl text-white sm:text-5xl">{featured.title}</h2>
            <p className="relative mt-4 max-w-2xl text-lg text-silver-200">{featured.summary}</p>
            <span className="relative mt-8 inline-flex items-center gap-1.5 font-semibold text-gold-300 group-hover:underline">Read more <ArrowUpRight size={16} /></span>
          </Link>
        )}
        {others.length > 0 && (
          <section>
            <h2 className="mb-6 text-2xl">More ventures</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {others.map((v) => (
                <Link key={v._id} href={`/ventures/${v.slug}`} className="card group flex gap-4 p-6 hover:border-accent">
                  <Building2 className="shrink-0 text-accent" />
                  <div><p className="font-serif text-xl font-semibold text-heading group-hover:text-accent">{v.title}</p><p className="text-sm text-muted">{v.role}</p><p className="mt-2 text-sm">{v.summary}</p></div>
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="card p-8">
          <h2 className="text-2xl">Future ventures</h2>
          <p className="mt-2 max-w-2xl text-muted">New startups, investments and entrepreneurial initiatives will be introduced here as they launch. Interested in partnering?</p>
          <Link href="/contact?category=business" className="btn-primary mt-6">Discuss a collaboration</Link>
        </section>
      </div>
    </>
  );
}

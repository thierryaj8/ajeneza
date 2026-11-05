import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Layers } from "lucide-react";
import { Markdown } from "@/components/content/Markdown";
import { SocialLinks } from "@/components/layout/Social";
import { one } from "@/lib/api";
import { JsonLd, pageMeta } from "@/lib/seo";
import { DEV_STATUS } from "@/lib/site";
import type { Venture } from "@/lib/types";

const get = (slug: string) => one<Venture>("ventures", slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const v = await get((await params).slug);
  return v ? pageMeta({ title: v.title, description: v.summary, path: `/ventures/${v.slug}`, image: v.logo?.url, seo: v.seo }) : { title: "Not found" };
}

export default async function VenturePage({ params }: { params: Promise<{ slug: string }> }) {
  const v = await get((await params).slug);
  if (!v) notFound();
  const projects = (v.projects ?? []).filter((p) => p.status === "published");
  return (
    <article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: v.title, url: v.website || undefined, description: v.summary, founder: { "@type": "Person", name: "AJENEZA M. Thierry" }, sameAs: v.socialLinks?.map((s) => s.url) }} />
      <header className="bg-navy text-white">
        <div className="container py-16 sm:py-24">
          <Link href="/ventures" className="inline-flex items-center gap-1.5 text-sm text-silver hover:text-white"><ArrowLeft size={14} /> Ventures</Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{v.role}{v.foundedYear ? ` · Since ${v.foundedYear}` : ""}</p>
          <h1 className="mt-3 text-5xl text-white sm:text-6xl">{v.title}</h1>
          <p className="mt-5 max-w-2xl text-xl text-silver-200">{v.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {v.website && <a href={v.website} target="_blank" rel="noopener noreferrer" className="btn bg-white text-navy hover:bg-silver-100">Official website <ExternalLink size={14} /></a>}
            <SocialLinks links={v.socialLinks} className="text-white" />
          </div>
        </div>
      </header>
      <div className="container max-w-5xl space-y-16 py-16">
        {v.description && <section><h2 className="mb-4 text-3xl">Introduction</h2><Markdown>{v.description}</Markdown></section>}
        {(v.mission || v.vision) && (
          <section className="grid gap-4 md:grid-cols-2">
            {v.mission && <div className="card p-8"><p className="eyebrow">Mission</p><Markdown className="mt-3">{v.mission}</Markdown></div>}
            {v.vision && <div className="card p-8"><p className="eyebrow">Vision</p><Markdown className="mt-3">{v.vision}</Markdown></div>}
          </section>
        )}
        {!!v.services?.length && (
          <section>
            <h2 className="mb-6 text-3xl">Services</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {v.services.map((s, i) => (
                <li key={s.title} className="card p-6">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 font-serif text-lg font-semibold text-heading">{s.title}</p>
                  {s.description && <p className="mt-1 text-sm text-muted">{s.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {!!v.solutions?.length && <section><h2 className="mb-4 text-3xl">Technology solutions</h2><ul className="flex flex-wrap gap-2">{v.solutions.map((s) => <li key={s} className="chip text-sm">{s}</li>)}</ul></section>}
        {(!!v.products?.length || projects.length > 0) && (
          <section>
            <h2 className="mb-6 text-3xl">Projects and products</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {v.products?.map((p) => (
                <li key={p.name} className="card p-6"><Layers className="text-accent" size={18} /><p className="mt-2 font-semibold text-heading">{p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{p.name} ↗</a> : p.name}</p><p className="text-sm text-muted">{p.description}</p></li>
              ))}
              {projects.map((p) => (
                <li key={p._id} className="card p-6"><span className="chip">{DEV_STATUS[p.devStatus]}</span><p className="mt-2 font-semibold text-heading"><Link href={`/projects/${p.slug}`} className="hover:text-accent">{p.title}</Link></p><p className="text-sm text-muted">{p.summary}</p></li>
              ))}
            </ul>
          </section>
        )}
        {!!v.achievements?.length && <section><h2 className="mb-4 text-3xl">Achievements</h2><ul className="list-disc space-y-2 pl-5">{v.achievements.map((a) => <li key={a}>{a}</li>)}</ul></section>}
        <section className="bg-accent p-8 text-accent-ink sm:p-12">
          <h2 className="text-3xl text-inherit">Collaborate with {v.title}</h2>
          {v.collaboration && <p className="mt-3 max-w-2xl opacity-90">{v.collaboration}</p>}
          <Link href="/contact?category=business" className="btn mt-6 bg-white text-navy hover:bg-silver-100">Start a conversation</Link>
        </section>
      </div>
    </article>
  );
}

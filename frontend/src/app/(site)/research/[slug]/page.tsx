import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { Markdown } from "@/components/content/Markdown";
import { ShareButtons } from "@/components/content/Share";
import { one } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { JsonLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Research } from "@/lib/types";

const get = (slug: string) => one<Research>("research", slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await get((await params).slug);
  return r ? pageMeta({ title: r.title, description: r.abstract, path: `/research/${r.slug}`, image: r.coverImage?.url, seo: r.seo, type: "article" }) : { title: "Not found" };
}

export default async function ResearchItemPage({ params }: { params: Promise<{ slug: string }> }) {
  const r = await get((await params).slug);
  if (!r) notFound();
  return (
    <article className="container max-w-3xl py-14">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ScholarlyArticle", headline: r.title, abstract: r.abstract, datePublished: r.publishedAt, author: { "@type": "Person", name: "AJENEZA M. Thierry" } }} />
      <Link href="/research" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent"><ArrowLeft size={14} /> Research & Insights</Link>
      <p className="eyebrow mt-8">{r.kind}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">{r.title}</h1>
      <p className="mt-4 text-sm text-muted">{formatDate(r.publishedAt)} · {r.readingTime} min read</p>
      {r.abstract && <div className="mt-8 rounded-2xl bg-surface-2 p-6"><p className="text-xs font-semibold uppercase tracking-wider text-muted">Abstract</p><p className="mt-2 text-lg">{r.abstract}</p></div>}
      <div className="mt-10"><Markdown>{r.body}</Markdown></div>
      {!!r.attachments?.length && (
        <section className="mt-10"><h2 className="mb-3 text-xl">Attachments</h2>
          <ul className="space-y-2">{r.attachments.map((a) => <li key={a.url}><a href={a.url} className="link inline-flex items-center gap-2" target="_blank" rel="noopener noreferrer"><Paperclip size={14} /> {a.label}</a></li>)}</ul>
        </section>
      )}
      <div className="mt-10"><ShareButtons url={`${SITE_URL}/research/${r.slug}`} title={r.title} /></div>
    </article>
  );
}

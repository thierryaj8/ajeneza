import type { Metadata } from "next";
import Image from "@/components/content/Img";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookText, CheckCircle2, Github, Globe } from "lucide-react";
import { Cover } from "@/components/content/Cover";
import { Markdown } from "@/components/content/Markdown";
import { ShareButtons } from "@/components/content/Share";
import { one } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { JsonLd, pageMeta } from "@/lib/seo";
import { DEV_STATUS, PROJECT_CATEGORIES, SITE_URL } from "@/lib/site";
import type { Project } from "@/lib/types";

const get = (slug: string) => one<Project>("projects", slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await get((await params).slug);
  return p ? pageMeta({ title: p.title, description: p.summary, path: `/projects/${p.slug}`, image: p.images?.[0]?.url, seo: p.seo }) : { title: "Not found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await get((await params).slug);
  if (!p) notFound();
  const [hero, ...gallery] = p.images ?? [];
  return (
    <article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "SoftwareSourceCode", name: p.title, description: p.summary, codeRepository: p.githubUrl, programmingLanguage: p.technologies, author: { "@type": "Person", name: "AJENEZA M. Thierry" }, dateCreated: p.dateCreated }} />
      <header className="container max-w-5xl pt-12">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent"><ArrowLeft size={14} /> Projects</Link>
        <div className="mt-6 flex flex-wrap gap-2">
          <span className="chip border-accent text-accent">{DEV_STATUS[p.devStatus]}</span>
          {p.categories?.map((c) => <span key={c} className="chip">{PROJECT_CATEGORIES[c]}</span>)}
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl">{p.title}</h1>
        {p.summary && <p className="mt-4 max-w-3xl text-xl leading-relaxed text-muted">{p.summary}</p>}
        <div className="mt-8 flex flex-wrap gap-3">
          {p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary"><Globe size={16} /> Live demo</a>}
          {p.githubUrl && <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary"><Github size={16} /> Source code</a>}
          {p.docsUrl && <a href={p.docsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary"><BookText size={16} /> Documentation</a>}
        </div>
      </header>
      <div className="container mt-10 max-w-5xl">
        <Cover image={hero} title={p.title} kind="project" priority className="aspect-[16/9] rounded-2xl" sizes="(min-width:1024px) 1024px, 100vw" />
      </div>
      <div className="container grid max-w-5xl gap-12 py-14 lg:grid-cols-3">
        <div className="space-y-12 lg:col-span-2">
          {p.problem && <section><h2 className="mb-4 text-2xl">The problem</h2><Markdown>{p.problem}</Markdown></section>}
          {!!p.objectives?.length && (
            <section><h2 className="mb-4 text-2xl">Objectives</h2>
              <ul className="space-y-2">{p.objectives.map((o) => <li key={o} className="flex gap-3"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" />{o}</li>)}</ul>
            </section>
          )}
          {p.description && <section><h2 className="mb-4 text-2xl">About the project</h2><Markdown>{p.description}</Markdown></section>}
          {!!p.features?.length && (
            <section><h2 className="mb-4 text-2xl">Features</h2>
              <ul className="grid gap-3 sm:grid-cols-2">{p.features.map((f) => <li key={f} className="card p-4 text-sm">{f}</li>)}</ul>
            </section>
          )}
          {gallery.length > 0 && (
            <section><h2 className="mb-4 text-2xl">Gallery</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {gallery.map((img) => <div key={img.url} className="relative aspect-video overflow-hidden rounded-xl bg-surface-2"><Image src={img.url} alt={img.alt || ""} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover" /></div>)}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-sans text-sm uppercase tracking-wider text-muted">Technologies</h2>
            <ul className="mt-3 flex flex-wrap gap-1.5">{p.technologies?.map((t) => <li key={t} className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs">{t}</li>)}</ul>
            {p.dateCreated && <><h2 className="mt-6 font-sans text-sm uppercase tracking-wider text-muted">Started</h2><p className="mt-1">{formatDate(p.dateCreated, { year: "numeric", month: "long" })}</p></>}
          </div>
          <ShareButtons url={`${SITE_URL}/projects/${p.slug}`} title={p.title} />
        </aside>
      </div>
    </article>
  );
}

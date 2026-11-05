import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { BOOK_STATUS, DEV_STATUS, PROJECT_CATEGORIES } from "@/lib/site";
import type { Article, Book, Project, Research } from "@/lib/types";
import { Cover } from "@/components/content/Cover";

export function ArticleCard({ article, variant = "default" }: { article: Article; variant?: "default" | "large" | "compact" }) {
  const href = `/${article.section}/${article.slug}`;
  if (variant === "compact") {
    return (
      <article className="group py-4">
        <p className="eyebrow">{article.category?.name ?? (article.section === "journalism" ? "Journalism" : "Blog")}</p>
        <h3 className="mt-1.5 text-lg leading-snug"><Link href={href} className="group-hover:text-accent">{article.title}</Link></h3>
        <p className="mt-1 text-xs text-muted">{formatDate(article.publishedAt)} · {article.readingTime} min read</p>
      </article>
    );
  }
  const large = variant === "large";
  return (
    <article className="group flex h-full flex-col">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <Cover image={article.coverImage} title={article.title} className={`rounded-2xl ${large ? "aspect-[16/9]" : "aspect-[3/2]"}`} sizes={large ? "(min-width: 1024px) 60vw, 100vw" : undefined} />
      </Link>
      <div className="mt-4 flex flex-1 flex-col">
        <p className="eyebrow">{article.category?.name ?? (article.section === "journalism" ? "Journalism" : "Blog")}</p>
        <h3 className={`mt-2 leading-tight ${large ? "text-3xl" : "text-xl"}`}>
          <Link href={href} className="group-hover:text-accent">{article.title}</Link>
        </h3>
        {(article.excerpt || article.subtitle) && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{article.excerpt || article.subtitle}</p>}
        <p className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          <span className="flex items-center gap-1"><Clock size={12} /> {article.readingTime} min read</span>
        </p>
      </div>
    </article>
  );
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/5">
      <Cover image={project.images?.[0]} title={project.title} kind="project" className="aspect-[16/9]" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{DEV_STATUS[project.devStatus] ?? project.devStatus}</span>
          {project.categories?.slice(0, 2).map((c) => <span key={c} className="text-xs text-muted">{PROJECT_CATEGORIES[c] ?? c}</span>)}
        </div>
        <h3 className="mt-3 text-xl">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">{project.title}</Link>
        </h3>
        {project.summary && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>}
        {!!project.technologies?.length && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {project.technologies.slice(0, 5).map((t) => <li key={t} className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-ink">{t}</li>)}
          </ul>
        )}
      </div>
    </article>
  );
}

export function BookCard({ book }: { book: Book }) {
  return (
    <article className="group">
      <Link href={`/books/${book.slug}`} className="block">
        <Cover image={book.coverImage} title={book.title} kind="book" className="aspect-[2/3] rounded-lg shadow-xl shadow-navy/10 transition group-hover:-translate-y-1" sizes="(min-width: 1024px) 20vw, 50vw" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-accent">{BOOK_STATUS[book.publicationStatus]}</p>
        <h3 className="mt-1 text-lg leading-snug group-hover:text-accent">{book.title}</h3>
        {book.subtitle && <p className="mt-1 text-sm text-muted">{book.subtitle}</p>}
      </Link>
    </article>
  );
}

export function ResearchCard({ item }: { item: Research }) {
  return (
    <article className="card group relative p-6">
      <p className="eyebrow">{item.kind}</p>
      <h3 className="mt-2 text-xl"><Link href={`/research/${item.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">{item.title}</Link></h3>
      {item.abstract && <p className="mt-2 line-clamp-3 text-sm text-muted">{item.abstract}</p>}
      <p className="mt-4 flex items-center gap-1 text-xs text-muted">{formatDate(item.publishedAt)} <ArrowUpRight size={12} className="ml-auto text-accent" /></p>
    </article>
  );
}

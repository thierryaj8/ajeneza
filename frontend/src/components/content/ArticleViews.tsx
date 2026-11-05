import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { ArticleCard } from "@/components/cards";
import { Comments } from "@/components/forms/Comments";
import { Cover } from "@/components/content/Cover";
import { Markdown } from "@/components/content/Markdown";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { ShareButtons } from "@/components/content/Share";
import { EmptyState, FilterBar, PageHeader, Pagination, SearchInput } from "@/components/ui";
import { api, list, one } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";
import type { Article, Category, Settings } from "@/lib/types";

type Section = "journalism" | "blog";
export interface ListParams { category?: string; q?: string; page?: string; sort?: string }

const COPY: Record<Section, { eyebrow: string; title: string; intro: string }> = {
  journalism: {
    eyebrow: "Journalism & Media",
    title: "Reporting, analysis and commentary",
    intro: "Politics, governance, African affairs, international relations and development, reported and argued with care.",
  },
  blog: {
    eyebrow: "Blog & Ideas",
    title: "Thoughts, ideas and knowledge",
    intro: "Technology, philosophy, psychology, leadership and entrepreneurship. Notes from a working mind.",
  },
};

export async function ArticleListPage({ section, params }: { section: Section; params: ListParams }) {
  const page = Number(params.page) || 1;
  const [categories, articles, popular] = await Promise.all([
    api<Category[]>(`/categories?section=${section}`, []),
    list<Article>("articles", { section, category: params.category, q: params.q, page, limit: 12, sort: params.sort }),
    list<Article>("articles", { section, sort: "popular", limit: 5 }),
  ]);
  const copy = COPY[section];
  const [lead, ...rest] = articles.items;
  const showLead = page === 1 && !params.q && !params.category && lead;

  return (
    <>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro}>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <SearchInput action={`/${section}`} defaultValue={params.q} placeholder={`Search ${section}…`} hidden={{ category: params.category }} />
          <span className="text-sm text-muted">
            <Link href={`/${section}`} className={!params.sort ? "font-semibold text-cream" : "text-silver hover:text-gold-300"}>Recent</Link>
            {" · "}
            <Link href={`/${section}?sort=popular`} className={params.sort === "popular" ? "font-semibold text-cream" : "text-silver hover:text-gold-300"}>Popular</Link>
          </span>
        </div>
      </PageHeader>
      <div className="container py-10">
        <FilterBar basePath={`/${section}`} active={params.category} items={categories.map((c) => ({ label: c.name, value: c.slug }))} extra={{ q: params.q }} />
      </div>
      <div className="container grid gap-14 pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {params.q && <p className="mb-6 text-sm text-muted">{articles.total} result{articles.total === 1 ? "" : "s"} for &ldquo;{params.q}&rdquo;</p>}
          {articles.items.length === 0 ? (
            <EmptyState title={params.q ? "No matching articles" : undefined} />
          ) : (
            <>
              {showLead && <div className="mb-12"><ArticleCard article={lead} variant="large" /></div>}
              <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
                {(showLead ? rest : articles.items).map((a) => <ArticleCard key={a._id} article={a} />)}
              </div>
            </>
          )}
          <Pagination page={articles.page} pages={articles.pages} basePath={`/${section}`} params={{ category: params.category, q: params.q, sort: params.sort }} />
        </div>
        <aside className="space-y-10 lg:col-span-4">
          {popular.items.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-wider text-muted">Most read</h2>
              <ol className="mt-2 divide-y divide-line">
                {popular.items.map((a, i) => (
                  <li key={a._id} className="flex gap-4 py-4">
                    <span className="font-serif text-3xl font-bold text-line">{i + 1}</span>
                    <Link href={`/${a.section}/${a.slug}`} className="font-medium leading-snug text-heading hover:text-accent">{a.title}</Link>
                  </li>
                ))}
              </ol>
            </section>
          )}
          <section className="card p-6">
            <h2 className="text-xl">Subscribe</h2>
            <p className="mt-1 text-sm text-muted">Get new pieces by email.</p>
            <NewsletterForm source={`${section}-sidebar`} />
          </section>
        </aside>
      </div>
    </>
  );
}

export async function getArticle(section: Section, slug: string) {
  return one<Article>("articles", slug, `?section=${section}`);
}

export async function ArticleDetailPage({ section, slug }: { section: Section; slug: string }) {
  const [article, settings] = await Promise.all([getArticle(section, slug), api<Settings>("/settings", {})]);
  if (!article) notFound();
  const related = await list<Article>("articles", { section, category: article.category?.slug, exclude: article.slug, limit: 3 });
  const url = `${SITE_URL}/${section}/${article.slug}`;

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org", "@type": section === "journalism" ? "NewsArticle" : "BlogPosting",
          headline: article.title, description: article.excerpt || article.subtitle, datePublished: article.publishedAt, dateModified: article.updatedAt,
          author: { "@type": "Person", name: article.author?.name ?? "AJENEZA M. Thierry", url: SITE_URL },
          image: article.coverImage?.url, mainEntityOfPage: url,
        }}
      />
      <header className="container max-w-4xl pb-10 pt-12 sm:pt-16">
        <Link href={`/${section}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent">
          <ArrowLeft size={14} /> {COPY[section].eyebrow}
        </Link>
        {article.category && (
          <p className="mt-8"><Link href={`/${section}?category=${article.category.slug}`} className="eyebrow hover:underline">{article.category.name}</Link></p>
        )}
        <h1 className="mt-3 text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">{article.title}</h1>
        {article.subtitle && <p className="mt-5 text-xl leading-relaxed text-muted sm:text-2xl">{article.subtitle}</p>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy font-serif text-gold-100" aria-hidden>A</span>
            <div>
              <p className="font-semibold text-heading">{article.author?.name ?? "AJENEZA M. Thierry"}</p>
              <p className="flex items-center gap-2 text-muted">
                <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time> · <Clock size={12} /> {article.readingTime} min read
              </p>
            </div>
          </div>
          <ShareButtons url={url} title={article.title} />
        </div>
      </header>
      {article.coverImage?.url && (
        <div className="container max-w-5xl">
          <Cover image={article.coverImage} title={article.title} priority className="aspect-[16/9] rounded-2xl" sizes="(min-width: 1024px) 1024px, 100vw" />
          {article.coverImage.alt && <p className="mt-2 text-center text-xs text-muted">{article.coverImage.alt}</p>}
        </div>
      )}
      <div className="container max-w-3xl py-12">
        <Markdown>{article.body}</Markdown>

        {!!article.sources?.length && (
          <section className="mt-12 rounded-2xl bg-surface-2 p-6">
            <h2 className="text-lg">Sources and references</h2>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
              {article.sources.map((s, i) => (
                <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" className="link">{s.title || s.url}</a> : s.title}</li>
              ))}
            </ol>
          </section>
        )}
        {!!article.tags?.length && (
          <ul className="mt-8 flex flex-wrap gap-2">{article.tags.map((t) => <li key={t._id} className="chip">#{t.name}</li>)}</ul>
        )}
        <div className="mt-10 flex justify-end"><ShareButtons url={url} title={article.title} /></div>
        {settings.commentsEnabled !== false && article.allowComments !== false && <Comments slug={article.slug} />}
      </div>
      {related.items.length > 0 && (
        <section className="border-t border-line bg-surface py-16">
          <div className="container">
            <h2 className="mb-8 text-3xl">Related articles</h2>
            <div className="grid gap-8 md:grid-cols-3">{related.items.map((a) => <ArticleCard key={a._id} article={a} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}

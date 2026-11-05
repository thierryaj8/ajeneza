import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Quote } from "lucide-react";
import { Cover } from "@/components/content/Cover";
import { Markdown } from "@/components/content/Markdown";
import { ShareButtons } from "@/components/content/Share";
import { one } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { JsonLd, pageMeta } from "@/lib/seo";
import { BOOK_STATUS, SITE_URL } from "@/lib/site";
import type { Book } from "@/lib/types";

const get = (slug: string) => one<Book>("books", slug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = await get((await params).slug);
  return b ? pageMeta({ title: b.title, description: b.summary, path: `/books/${b.slug}`, image: b.coverImage?.url, seo: b.seo }) : { title: "Not found" };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const book = await get((await params).slug);
  if (!book) notFound();
  const details = [
    ["Status", BOOK_STATUS[book.publicationStatus]], ["Genre", book.genre], ["Publisher", book.publisher],
    ["Published", formatDate(book.publicationDate)], ["Pages", book.pages], ["ISBN", book.isbn],
  ].filter(([, v]) => v);

  return (
    <article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Book", name: book.title, author: { "@type": "Person", name: "AJENEZA M. Thierry" }, isbn: book.isbn, image: book.coverImage?.url, description: book.summary, publisher: book.publisher, datePublished: book.publicationDate }} />
      <div className="bg-surface">
        <div className="container grid gap-12 py-14 md:grid-cols-12 md:py-20">
          <div className="md:col-span-4">
            <Cover image={book.coverImage} title={book.title} kind="book" priority className="mx-auto aspect-[2/3] max-w-xs rounded-lg shadow-2xl shadow-navy/20" sizes="320px" />
          </div>
          <div className="md:col-span-8">
            <Link href="/books" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent"><ArrowLeft size={14} /> Books</Link>
            <p className="eyebrow mt-6">{BOOK_STATUS[book.publicationStatus]}</p>
            <h1 className="mt-2 text-4xl sm:text-5xl">{book.title}</h1>
            {book.subtitle && <p className="mt-3 text-xl text-muted">{book.subtitle}</p>}
            {book.summary && <p className="mt-6 text-lg leading-relaxed">{book.summary}</p>}
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {details.map(([k, v]) => <div key={String(k)}><dt className="text-xs uppercase tracking-wider text-muted">{k}</dt><dd className="font-medium text-heading">{v}</dd></div>)}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {book.purchaseLinks?.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-primary">{l.label} <ExternalLink size={14} /></a>)}
              {book.downloadUrl && <a href={book.downloadUrl} className="btn-secondary" download>Download <Download size={14} /></a>}
            </div>
            <div className="mt-8"><ShareButtons url={`${SITE_URL}/books/${book.slug}`} title={book.title} /></div>
          </div>
        </div>
      </div>
      <div className="container max-w-3xl space-y-14 py-14">
        {book.description && <section><h2 className="mb-4 text-2xl">About the book</h2><Markdown>{book.description}</Markdown></section>}
        {!!book.excerpts?.length && (
          <section>
            <h2 className="mb-6 text-2xl">Excerpts</h2>
            <div className="space-y-6">
              {book.excerpts.map((e, i) => (
                <div key={i} className="card p-6 sm:p-8">
                  {e.title && <h3 className="mb-3 text-lg">{e.title}</h3>}
                  <Markdown className="font-serif">{e.body}</Markdown>
                </div>
              ))}
            </div>
          </section>
        )}
        {!!book.recommendations?.length && (
          <section>
            <h2 className="mb-6 text-2xl">What readers say</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {book.recommendations.map((r, i) => (
                <figure key={i} className="card p-6">
                  <Quote className="text-accent" size={20} />
                  <blockquote className="mt-3 font-serif text-lg text-heading">{r.quote}</blockquote>
                  <figcaption className="mt-3 text-sm text-muted">{r.source}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}

import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";

export const metadata = { title: "Search", robots: { index: false } };
interface Result { type: string; title: string; summary?: string; url: string }
const LABEL: Record<string, string> = { journalism: "Journalism", blog: "Blog", project: "Project", book: "Book", research: "Research" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const { results } = q.trim().length >= 2 ? await api<{ results: Result[] }>(`/search?q=${encodeURIComponent(q.trim())}`, { results: [] }) : { results: [] };
  return (
    <>
      <PageHeader eyebrow="Search" title="Search the site">
        <form action="/search" role="search" className="mt-8 flex max-w-xl gap-2">
          <label htmlFor="site-search" className="sr-only">Search</label>
          <input id="site-search" name="q" type="search" defaultValue={q} autoFocus placeholder="Articles, projects, books…" className="input" />
          <button className="btn-primary">Search</button>
        </form>
      </PageHeader>
      <div className="container max-w-3xl py-12">
        {q && results.length === 0 && <EmptyState title="No results" message={`Nothing matched “${q}”. Try a different word.`} />}
        <ul className="divide-y divide-line">
          {results.map((r) => (
            <li key={r.url} className="py-5">
              <p className="eyebrow">{LABEL[r.type] ?? r.type}</p>
              <Link href={r.url} className="mt-1 block font-serif text-xl font-semibold text-heading hover:text-accent">{r.title}</Link>
              {r.summary && <p className="mt-1 line-clamp-2 text-sm text-muted">{r.summary}</p>}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

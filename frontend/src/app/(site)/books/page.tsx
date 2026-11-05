import { BookCard } from "@/components/cards";
import { EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { list } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import type { Book } from "@/lib/types";

export const metadata = pageMeta({ title: "Books & Literature", path: "/books", description: "Books, essays, philosophical writings and psychological reflections by AJENEZA M. Thierry." });

const KINDS = [
  { value: "book", label: "Books" }, { value: "essay", label: "Essays" }, { value: "short_story", label: "Short stories" }, { value: "reflection", label: "Reflections" },
];

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const books = await list<Book>("books", { kind, limit: 100 });
  const groups = [
    { key: "published", title: "Published" },
    { key: "upcoming", title: "Upcoming" },
    { key: "in_progress", title: "In progress" },
  ].map((g) => ({ ...g, items: books.items.filter((b) => b.publicationStatus === g.key) })).filter((g) => g.items.length);

  return (
    <>
      <PageHeader eyebrow="Author & Writer" title="Books and literature" intro="Philosophy, psychology, human behavior and literature: books, essays, stories and reflections." />
      <div className="container py-10"><FilterBar basePath="/books" param="kind" active={kind} items={KINDS} /></div>
      <div className="container space-y-16 pb-10">
        {groups.length === 0 && <EmptyState />}
        {groups.map((g) => (
          <section key={g.key} aria-labelledby={`g-${g.key}`}>
            <h2 id={`g-${g.key}`} className="mb-8 text-2xl">{g.title}</h2>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">{g.items.map((b) => <BookCard key={b._id} book={b} />)}</div>
          </section>
        ))}
      </div>
    </>
  );
}

import Link from "next/link";
import { EmptyState } from "@/components/ui";
import { BOOK_STATUS, SITE_NAME } from "@/lib/site";
import type { Book } from "@/lib/types";
import { BookCover } from "@/components/cards/BookCover";
import { SectionHead } from "./SectionHead";

export function BooksSection({ books }: { books: Book[] }) {
  return (
    <section id="books" className="section">
      <div className="wrap">
        <SectionHead index="06" eyebrow="The writer's desk" title="Books, words & inner worlds." intro="A home for published work, works in progress and the ideas that deserve more than a passing thought." href="/books" linkLabel="All books" />
        {!books.length ? <EmptyState /> : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {books.slice(0, 3).map((b, i) => (
              <Link key={b._id} href={`/books/${b.slug}`} className="group grid grid-cols-[104px_1fr] items-center gap-5">
                <BookCover book={b} variant={i} author={SITE_NAME} />
                <div>
                  <small className="text-[10px] uppercase tracking-[0.13em] text-accent">{b.genre ?? "Literary work"} · {BOOK_STATUS[b.publicationStatus]}</small>
                  <h3 className="my-1.5 text-xl leading-snug group-hover:text-accent">{b.title}</h3>
                  {b.summary && <p className="text-xs leading-relaxed text-muted">{b.summary}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

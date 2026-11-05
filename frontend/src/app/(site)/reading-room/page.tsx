import { BookMarked, ExternalLink } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/ui";
import { list } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import type { ReadingItem } from "@/lib/types";

export const metadata = pageMeta({ title: "Reading Room", path: "/reading-room", description: "Recommended books, research, essays and influential publications." });
const SHELVES = [{ key: "reading", title: "Currently reading" }, { key: "influential", title: "Influential" }, { key: "recommended", title: "Recommended" }];

export default async function ReadingRoomPage() {
  const items = await list<ReadingItem>("reading-list", { limit: 100 });
  return (
    <>
      <PageHeader eyebrow="Reading Room" title="A personal library" intro="Books, research and essays that shaped my thinking, and ones I recommend." />
      <div className="container space-y-14 py-14">
        {items.items.length === 0 && <EmptyState />}
        {SHELVES.map((s) => {
          const shelf = items.items.filter((i) => i.shelf === s.key);
          if (!shelf.length) return null;
          return (
            <section key={s.key}>
              <h2 className="mb-6 text-2xl">{s.title}</h2>
              <ul className="grid gap-4 md:grid-cols-2">
                {shelf.map((i) => (
                  <li key={i._id} className="card flex gap-4 p-6">
                    <BookMarked className="shrink-0 text-accent" size={20} />
                    <div>
                      <p className="font-serif text-lg font-semibold text-heading">{i.url ? <a href={i.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{i.title} <ExternalLink size={12} className="inline" /></a> : i.title}</p>
                      <p className="text-sm text-muted">{i.author} · <span className="capitalize">{i.type}</span></p>
                      {i.note && <p className="mt-2 text-sm">{i.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}

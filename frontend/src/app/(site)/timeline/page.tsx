import { EmptyState, FilterBar, PageHeader } from "@/components/ui";
import { list } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import { TIMELINE_CATEGORIES } from "@/lib/site";
import type { TimelineEntry } from "@/lib/types";

export const metadata = pageMeta({ title: "Timeline", path: "/timeline", description: "A chronological record of education, career, company, publications and projects." });

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const entries = await list<TimelineEntry>("timeline", { timelineCategory: category, limit: 100 });
  const byYear = new Map<number, TimelineEntry[]>();
  for (const e of entries.items) {
    const y = new Date(e.date).getFullYear();
    byYear.set(y, [...(byYear.get(y) ?? []), e]);
  }
  return (
    <>
      <PageHeader eyebrow="Personal timeline" title="The journey so far" intro="Education, career milestones, company activities, publications, projects and leadership." />
      <div className="container py-10"><FilterBar basePath="/timeline" active={category} items={Object.entries(TIMELINE_CATEGORIES).map(([value, label]) => ({ value, label }))} /></div>
      <div className="container max-w-4xl pb-10">
        {entries.items.length === 0 && <EmptyState />}
        {[...byYear.entries()].map(([year, items]) => (
          <section key={year} className="grid gap-6 border-t border-line py-10 sm:grid-cols-[120px_1fr]">
            <h2 className="font-serif text-4xl text-accent">{year}</h2>
            <ol className="space-y-8">
              {items.map((e) => (
                <li key={e._id}>
                  <p className="flex flex-wrap gap-2 text-sm text-muted"><span className="chip">{TIMELINE_CATEGORIES[e.category]}</span>{formatDate(e.date, { month: "long", year: "numeric" })}{e.endDate && ` – ${formatDate(e.endDate, { month: "long", year: "numeric" })}`}</p>
                  <h3 className="mt-2 text-xl">{e.link ? <a href={e.link} className="hover:text-accent">{e.title}</a> : e.title}</h3>
                  {e.organization && <p className="text-sm font-medium text-muted">{e.organization}</p>}
                  {e.description && <p className="mt-1 text-ink">{e.description}</p>}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}

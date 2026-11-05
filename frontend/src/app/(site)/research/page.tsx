import { ResearchCard } from "@/components/cards";
import { EmptyState, FilterBar, PageHeader, Pagination } from "@/components/ui";
import { list } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import type { Research } from "@/lib/types";

export const metadata = pageMeta({ title: "Research & Insights", path: "/research", description: "Research, technical experiments, observations and innovation insights." });
const KINDS = [{ value: "research", label: "Research" }, { value: "experiment", label: "Experiments" }, { value: "observation", label: "Observations" }, { value: "insight", label: "Insights" }];

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ kind?: string; page?: string }> }) {
  const sp = await searchParams;
  const items = await list<Research>("research", { kind: sp.kind, page: Number(sp.page) || 1, limit: 12 });
  return (
    <>
      <PageHeader eyebrow="Research & Insights" title="Experiments, observations and ideas" intro="A working notebook: research, technical experiments and innovation-related publications." />
      <div className="container py-10"><FilterBar basePath="/research" param="kind" active={sp.kind} items={KINDS} /></div>
      <div className="container pb-10">
        {items.items.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{items.items.map((r) => <ResearchCard key={r._id} item={r} />)}</div> : <EmptyState />}
        <Pagination page={items.page} pages={items.pages} basePath="/research" params={{ kind: sp.kind }} />
      </div>
    </>
  );
}

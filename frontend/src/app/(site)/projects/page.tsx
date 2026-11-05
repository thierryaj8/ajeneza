import { ProjectCard } from "@/components/cards";
import { EmptyState, FilterBar, PageHeader, Pagination } from "@/components/ui";
import { list } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { DEV_STATUS, PROJECT_CATEGORIES } from "@/lib/site";
import type { Project } from "@/lib/types";

export const metadata = pageMeta({ title: "Technology & Projects", path: "/projects", description: "Software engineering, AI, cloud and open-source projects by AJENEZA M. Thierry." });

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const projects = await list<Project>("projects", { projectCategory: sp.category, devStatus: sp.status, page: Number(sp.page) || 1, limit: 12 });
  return (
    <>
      <PageHeader eyebrow="Technology & Software" title="Project portfolio" intro="Full-stack development, mobile, artificial intelligence, cloud, DevOps and research: what I've built and what I'm building." />
      <div className="container space-y-3 py-10">
        <FilterBar basePath="/projects" active={sp.category} items={Object.entries(PROJECT_CATEGORIES).map(([value, label]) => ({ value, label }))} extra={{ status: sp.status }} />
        <FilterBar basePath="/projects" param="status" allLabel="Any status" active={sp.status} items={Object.entries(DEV_STATUS).map(([value, label]) => ({ value, label }))} extra={{ category: sp.category }} />
      </div>
      <div className="container pb-10">
        {projects.items.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{projects.items.map((p) => <ProjectCard key={p._id} project={p} />)}</div>
        ) : <EmptyState title="No projects match" />}
        <Pagination page={projects.page} pages={projects.pages} basePath="/projects" params={{ category: sp.category, status: sp.status }} />
      </div>
    </>
  );
}

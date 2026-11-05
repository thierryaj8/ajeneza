import type { Project } from "@/lib/types";
import { ProjectFilterGrid } from "./ProjectFilterGrid";
import { SectionHead } from "./SectionHead";

export function TechnologySection({ projects }: { projects: Project[] }) {
  return (
    <section id="technology" className="section bg-[#eee9df] dark:bg-surface">
      <div className="wrap">
        <SectionHead index="04" eyebrow="Technology & innovation" title="Ideas made tangible." intro="A growing collection of software, experiments and digital products." href="/projects" linkLabel="Full portfolio" />
        <ProjectFilterGrid projects={projects} />
      </div>
    </section>
  );
}

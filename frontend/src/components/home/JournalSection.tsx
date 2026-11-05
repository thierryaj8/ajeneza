import type { Article, Category } from "@/lib/types";
import { JournalGrid } from "./JournalGrid";
import { SectionHead } from "./SectionHead";

export function JournalSection({ articles, categories }: { articles: Article[]; categories: Category[] }) {
  return (
    <section id="blog" className="section">
      <div className="wrap">
        <SectionHead index="08" eyebrow="The journal" title="Ideas in progress." href="/blog" linkLabel="All journal entries" />
        <JournalGrid articles={articles} categories={categories} />
      </div>
    </section>
  );
}

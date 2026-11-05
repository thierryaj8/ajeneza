import { AboutSection } from "@/components/home/AboutSection";
import { BooksSection } from "@/components/home/BooksSection";
import { ContactSection } from "@/components/home/ContactSection";
import { DisciplinesSection } from "@/components/home/DisciplinesSection";
import { Hero } from "@/components/home/Hero";
import { IntroStrip } from "@/components/home/IntroStrip";
import { JournalSection } from "@/components/home/JournalSection";
import { LeadershipSection } from "@/components/home/LeadershipSection";
import { TechnologySection } from "@/components/home/TechnologySection";
import { VentureSection } from "@/components/home/VentureSection";
import { WritingSection } from "@/components/home/WritingSection";
import { api, list } from "@/lib/api";
import { JsonLd } from "@/lib/seo";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import type { Article, Book, Category, Profile, Project, Settings, Venture } from "@/lib/types";

/** Homepage: data is fetched here, presentation lives in components/home/*. */
export default async function HomePage() {
  const [settings, profile, journalism, journal, categories, projects, books, ventures] = await Promise.all([
    api<Settings>("/settings", {}),
    api<Profile>("/profile", {}),
    list<Article>("articles", { section: "journalism", limit: 4 }),
    list<Article>("articles", { section: "blog", limit: 6 }),
    api<Category[]>("/categories?section=blog", []),
    list<Project>("projects", { limit: 6 }),
    list<Book>("books", { limit: 3 }),
    list<Venture>("ventures", { featured: true, limit: 1 }),
  ]);

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Person", name: SITE_NAME, url: SITE_URL, jobTitle: profile.roles?.join(", "),
        worksFor: { "@type": "Organization", name: "OrLabs Tech Industries" }, sameAs: settings.socialLinks?.map((s) => s.url),
      }} />
      <Hero settings={settings} profile={profile} />
      <IntroStrip quote={settings.heroQuote} />
      <AboutSection profile={profile} />
      <DisciplinesSection />
      <WritingSection articles={[...journalism.items].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))} />
      <TechnologySection projects={projects.items} />
      <VentureSection venture={ventures.items[0]} />
      <BooksSection books={books.items} />
      <LeadershipSection profile={profile} />
      <JournalSection articles={journal.items} categories={categories} />
      <ContactSection settings={settings} profile={profile} />
    </>
  );
}

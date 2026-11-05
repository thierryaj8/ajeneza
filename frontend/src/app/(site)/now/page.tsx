import { BookOpen, Hammer, Lightbulb, Rocket, Sparkles } from "lucide-react";
import { Markdown } from "@/components/content/Markdown";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import type { Settings } from "@/lib/types";

export const metadata = pageMeta({ title: "Now", path: "/now", description: "What I'm building, learning and reading right now." });

export default async function NowPage() {
  const { now = {} } = await api<Settings>("/settings", {});
  const rows = [
    { icon: Hammer, title: "What I'm building", body: now.building },
    { icon: Lightbulb, title: "What I'm learning", body: now.learning },
    { icon: BookOpen, title: "What I'm reading", body: now.reading },
    { icon: Sparkles, title: "Current interests", body: now.interests },
    { icon: Rocket, title: "Ongoing activities", body: now.activities },
  ].filter((r) => r.body);
  return (
    <>
      <PageHeader eyebrow="Now" title="What I'm doing now" intro={now.updatedAt ? `Last updated ${formatDate(now.updatedAt)}.` : undefined} />
      <div className="container max-w-3xl divide-y divide-line py-10">
        {rows.map(({ icon: Icon, title, body }) => (
          <section key={title} className="grid gap-4 py-8 sm:grid-cols-[200px_1fr]">
            <h2 className="flex items-center gap-2 font-sans text-sm uppercase tracking-wider text-muted"><Icon size={16} className="text-accent" /> {title}</h2>
            <Markdown>{body}</Markdown>
          </section>
        ))}
      </div>
    </>
  );
}

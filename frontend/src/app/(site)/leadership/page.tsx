import Image from "@/components/content/Img";
import Link from "next/link";
import { CalendarDays, MapPin, Mic2 } from "lucide-react";
import { ArticleCard } from "@/components/cards";
import { Markdown } from "@/components/content/Markdown";
import { EmptyState, PageHeader } from "@/components/ui";
import { api, list } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { pageMeta } from "@/lib/seo";
import type { Article, EventItem, Profile } from "@/lib/types";

export const metadata = pageMeta({ title: "Leadership & Speaking", path: "/leadership", description: "Speaking topics, events, mentorship and community initiatives." });

const TYPE_LABEL: Record<string, string> = { speaking: "Speaking", conference: "Conference", mentorship: "Mentorship", community: "Community", workshop: "Workshop" };

export default async function LeadershipPage() {
  const [profile, events, articles] = await Promise.all([
    api<Profile>("/profile", {}),
    list<EventItem>("events", { limit: 50 }),
    list<Article>("articles", { section: "blog", category: "leadership", limit: 3 }),
  ]);
  const photos = events.items.flatMap((e) => (e.images ?? []).map((img) => ({ ...img, event: e.title }))).slice(0, 8);

  return (
    <>
      <PageHeader eyebrow="Leadership & Public Speaking" title="Leading, speaking and mentoring" intro="Leadership, youth development, mentorship, innovation and African development.">
        <Link href="/contact?category=speaking" className="btn-primary mt-8"><Mic2 size={16} /> Invite me to speak</Link>
      </PageHeader>
      <div className="container space-y-20 py-16">
        {profile.leadershipBio && (
          <section className="grid gap-8 lg:grid-cols-12">
            <h2 className="text-3xl lg:col-span-4">Leadership biography</h2>
            <div className="lg:col-span-8"><Markdown>{profile.leadershipBio}</Markdown></div>
          </section>
        )}
        <section>
          <h2 className="mb-8 text-3xl">Speaking topics</h2>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(profile.speakingTopics ?? []).map((t, i) => (
              <li key={t.title} className="card p-6">
                <span className="font-serif text-4xl font-bold text-accent/30">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-xl">{t.title}</h3>
                {t.description && <p className="mt-2 text-sm text-muted">{t.description}</p>}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="mb-8 text-3xl">Events, conferences and mentorship</h2>
          {events.items.length ? (
            <ol className="relative space-y-6 border-l border-line pl-8">
              {events.items.map((e) => (
                <li key={e._id} className="relative">
                  <span className="absolute -left-[38px] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg" aria-hidden />
                  <p className="flex flex-wrap items-center gap-3 text-sm text-muted">
                    <span className="chip">{TYPE_LABEL[e.type] ?? e.type}</span>
                    {e.date && <span className="flex items-center gap-1"><CalendarDays size={14} /> {formatDate(e.date)}</span>}
                    {e.location && <span className="flex items-center gap-1"><MapPin size={14} /> {e.location}</span>}
                  </p>
                  <h3 className="mt-2 text-xl">{e.link ? <a href={e.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{e.title} ↗</a> : e.title}</h3>
                  {e.topic && <p className="text-sm font-medium text-accent">{e.topic}</p>}
                  {e.description && <p className="mt-1 max-w-2xl text-muted">{e.description}</p>}
                </li>
              ))}
            </ol>
          ) : <EmptyState />}
        </section>
        {photos.length > 0 && (
          <section>
            <h2 className="mb-8 text-3xl">Event photographs</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {photos.map((p) => <div key={p.url} className="relative aspect-square overflow-hidden rounded-xl"><Image src={p.url} alt={p.alt || p.event} fill sizes="25vw" className="object-cover" /></div>)}
            </div>
          </section>
        )}
        {articles.items.length > 0 && (
          <section>
            <h2 className="mb-8 text-3xl">Leadership articles</h2>
            <div className="grid gap-8 md:grid-cols-3">{articles.items.map((a) => <ArticleCard key={a._id} article={a} />)}</div>
          </section>
        )}
      </div>
    </>
  );
}

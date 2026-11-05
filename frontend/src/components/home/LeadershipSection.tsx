import type { Profile } from "@/lib/types";
import { SectionHead } from "./SectionHead";

const DEFAULTS = [
  { tag: "Speaking", title: "Public Speaking", text: "Sharing ideas on technology, leadership, innovation and African development." },
  { tag: "Leadership", title: "Community & Mentorship", text: "Learning with others, supporting young people and contributing to community initiatives." },
  { tag: "Development", title: "Youth & Innovation", text: "Exploring opportunities to build skills, create solutions and widen access to knowledge." },
];

export function LeadershipSection({ profile }: { profile: Profile }) {
  const items = profile.speakingTopics?.length
    ? profile.speakingTopics.slice(0, 3).map((t) => ({ tag: "Topic", title: t.title, text: t.description ?? "" }))
    : DEFAULTS;
  return (
    <section id="leadership" className="section bg-navy text-cream">
      <div className="wrap">
        <SectionHead dark index="07" eyebrow="Leadership & engagement" title="Ideas are stronger when shared." intro="Experiences and conversations that connect people, encourage learning and turn ambition into collective progress." href="/leadership" linkLabel="Leadership & speaking" />
        <div className="grid gap-px border border-white/20 bg-white/20 md:grid-cols-3">
          {items.map((it, i) => (
            <article key={it.title} className="min-h-[170px] bg-navy p-7">
              <span className="text-[10px] uppercase tracking-[0.14em] text-gold-300">{String(i + 1).padStart(2, "0")} / {it.tag}</span>
              <h3 className="mb-2 mt-4 text-[23px] text-cream">{it.title}</h3>
              <p className="text-xs leading-relaxed text-silver">{it.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

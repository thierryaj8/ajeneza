import Link from "next/link";
import { SectionHead } from "./SectionHead";

const ROLES = [
  { n: "01 — The public square", title: "Journalism & Media", text: "Politics, governance, African affairs, public policy, current events and thoughtful commentary.", href: "/journalism", cta: "Explore writing" },
  { n: "02 — The written word", title: "Books & Literature", text: "Philosophy, psychology, essays and reflections on people, society and the human experience.", href: "/books", cta: "Explore books" },
  { n: "03 — The maker's mind", title: "Technology", text: "Software development, artificial intelligence, machine learning and emerging technologies.", href: "/projects", cta: "Explore projects" },
  { n: "04 — Building together", title: "Leadership & Enterprise", text: "Entrepreneurship, public speaking, mentorship and building solutions with others.", href: "/ventures", cta: "Explore ventures" },
];

export function DisciplinesSection() {
  return (
    <section className="section bg-navy text-cream">
      <div className="wrap">
        <SectionHead dark index="02" eyebrow="Professional interests" title="Many disciplines. One curiosity." intro="Different ways of exploring the world: through questions, words, systems and people." />
        <div className="grid grid-cols-1 border-l border-t border-white/20 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r) => (
            <article key={r.title} className="min-h-[190px] border-b border-r border-white/20 p-6 transition-colors hover:bg-white/5">
              <p className="font-serif text-sm text-gold-300">{r.n}</p>
              <h3 className="mb-2 mt-6 text-[23px] text-cream">{r.title}</h3>
              <p className="text-xs leading-relaxed text-silver">{r.text}</p>
              <Link href={r.href} className="mt-4 inline-block text-[10px] uppercase tracking-[0.12em] text-gold-300 hover:underline">{r.cta} ↗</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

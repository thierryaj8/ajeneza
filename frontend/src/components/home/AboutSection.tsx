import Link from "next/link";
import { Markdown } from "@/components/content/Markdown";
import type { Profile } from "@/lib/types";
import { SectionHead } from "./SectionHead";

const DEFAULT_ROLES = ["Journalist & commentator", "Author & writer", "Developer & technologist", "Co-Founder & entrepreneur", "Leader & public speaker", "Lifelong learner"];

export function AboutSection({ profile }: { profile: Profile }) {
  const roles = profile.roles?.length ? profile.roles : DEFAULT_ROLES;
  return (
    <section id="about" className="section">
      <div className="wrap">
        <SectionHead index="01" eyebrow="The person behind the work" title="A life shaped by curiosity." intro="A space to bring together the different disciplines, questions and ambitions that guide my work." />
        <div className="grid items-start gap-10 md:grid-cols-[.82fr_1.18fr] md:gap-20">
          <aside className="bg-navy p-8 text-cream">
            <span aria-hidden className="block font-serif text-[75px] leading-[.7] text-gold-300">&ldquo;</span>
            <blockquote className="my-4 font-serif text-[23px] leading-snug">{profile.philosophy || "I believe ideas matter most when we have the courage to question them, and the discipline to turn them into something useful."}</blockquote>
            <small className="text-[10px] uppercase tracking-[0.15em] text-gold-300">Personal philosophy</small>
          </aside>
          <div>
            <Markdown className="prose-p:text-[15px] prose-p:leading-8 prose-p:text-muted lg:prose-base">{profile.shortBio || profile.fullBio}</Markdown>
            <ul className="mt-6 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
              {roles.map((r, i) => (
                <li key={r} className="flex items-center gap-3 border-t border-line py-3 font-serif text-base text-heading">
                  <span className="font-sans text-[11px] tracking-[0.1em] text-accent">{String(i + 1).padStart(2, "0")}</span> {r}
                </li>
              ))}
            </ul>
            <Link href="/about" className="text-link mt-6">Read the full biography ↗</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

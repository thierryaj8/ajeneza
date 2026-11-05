import Image from "@/components/content/Img";
import Link from "next/link";
import { GraduationCap, Languages } from "lucide-react";
import { Markdown } from "@/components/content/Markdown";
import { PageHeader } from "@/components/ui";
import { api, list } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import type { Achievement, Profile } from "@/lib/types";

export const metadata = pageMeta({ title: "About", path: "/about", description: "The biography, story, education and philosophy of AJENEZA M. Thierry." });

function Block({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line py-12 first:border-0 first:pt-0">
      <h2 id={`${id}-h`} className="text-3xl">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  const [p, achievements] = await Promise.all([api<Profile>("/profile", {}), list<Achievement>("achievements", { limit: 50 })]);
  const toc = [
    ["biography", "Biography"], ["story", "My Story"], ["education", "Education"], ["journey", "Professional Journey"],
    ["interests", "Career Interests"], ["philosophy", "Philosophy"], ["vision", "Vision & Mission"], ["skills", "Skills & Expertise"],
    ["languages", "Languages"], ["achievements", "Achievements"], ["aspirations", "Future Aspirations"],
  ];

  return (
    <>
      <PageHeader eyebrow="About me" title={p.name ?? "AJENEZA M. Thierry"} intro={p.headline}>
        {!!p.roles?.length && <ul className="mt-6 flex flex-wrap gap-2">{p.roles.map((r) => <li key={r} className="chip">{r}</li>)}</ul>}
      </PageHeader>
      <div className="container grid gap-12 py-14 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            {p.portrait?.url && (
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                <Image src={p.portrait.url} alt={p.portrait.alt || `Portrait of ${p.name}`} fill sizes="(min-width:1024px) 25vw, 100vw" className="object-cover" />
              </div>
            )}
            <nav aria-label="On this page" className="hidden lg:block">
              <ul className="space-y-1.5 border-l border-line text-sm">
                {toc.map(([id, label]) => <li key={id}><a href={`#${id}`} className="-ml-px block border-l border-transparent pl-4 text-muted hover:border-accent hover:text-accent">{label}</a></li>)}
              </ul>
            </nav>
            <Link href="/media-kit" className="btn-secondary w-full">Media kit</Link>
          </div>
        </aside>
        <div className="max-w-3xl lg:col-span-9">
          <Block id="biography" title="Biography"><Markdown>{p.fullBio || p.shortBio}</Markdown></Block>
          <Block id="story" title="My Story"><Markdown>{p.story}</Markdown></Block>
          <Block id="education" title="Educational Background">
            <ul className="space-y-4">
              {(p.education ?? []).map((e, i) => (
                <li key={i} className="flex gap-4">
                  <GraduationCap className="mt-1 shrink-0 text-accent" size={20} />
                  <div>
                    <p className="font-semibold text-heading">{e.qualification}</p>
                    <p className="text-muted">{e.institution}{e.period ? ` · ${e.period}` : ""}</p>
                    {e.notes && <p className="mt-1 text-sm">{e.notes}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </Block>
          <Block id="journey" title="Professional Journey"><Markdown>{p.journey}</Markdown><Link href="/timeline" className="link mt-4 inline-block font-semibold">See the full timeline →</Link></Block>
          <Block id="interests" title="Career Interests">
            <ul className="flex flex-wrap gap-2">{(p.careerInterests ?? []).map((c) => <li key={c} className="chip text-sm">{c}</li>)}</ul>
          </Block>
          <Block id="philosophy" title="Personal Philosophy"><Markdown>{p.philosophy}</Markdown></Block>
          <Block id="vision" title="Vision and Mission">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card p-6"><p className="eyebrow">Vision</p><p className="mt-2 font-serif text-lg text-heading">{p.vision}</p></div>
              <div className="card p-6"><p className="eyebrow">Mission</p><p className="mt-2 font-serif text-lg text-heading">{p.mission}</p></div>
            </div>
          </Block>
          <Block id="skills" title="Skills and Expertise">
            <div className="grid gap-6 sm:grid-cols-2">
              {(p.skills ?? []).map((s) => (
                <div key={s.group}>
                  <h3 className="font-sans text-sm uppercase tracking-wider text-muted">{s.group}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">{s.items.map((i) => <li key={i} className="rounded-md bg-surface-2 px-2.5 py-1 text-sm">{i}</li>)}</ul>
                </div>
              ))}
            </div>
          </Block>
          <Block id="languages" title="Languages">
            <ul className="flex flex-wrap gap-3">
              {(p.languages ?? []).map((l) => <li key={l.name} className="card flex items-center gap-2 px-4 py-2"><Languages size={16} className="text-accent" /><span className="font-medium">{l.name}</span><span className="text-sm text-muted">{l.level}</span></li>)}
            </ul>
          </Block>
          <Block id="achievements" title="Achievements">
            {achievements.items.length ? (
              <ul className="space-y-4">
                {achievements.items.map((a) => (
                  <li key={a._id} className="card p-5">
                    <p className="font-semibold text-heading">{a.link ? <a href={a.link} target="_blank" rel="noopener noreferrer" className="hover:text-accent">{a.title}</a> : a.title}</p>
                    <p className="text-sm text-muted">{[a.issuer, formatDate(a.date, { year: "numeric", month: "long" })].filter(Boolean).join(" · ")}</p>
                    {a.description && <p className="mt-2 text-sm">{a.description}</p>}
                  </li>
                ))}
              </ul>
            ) : <p className="text-muted">Verified achievements will be listed here.</p>}
          </Block>
          <Block id="aspirations" title="Future Aspirations"><Markdown>{p.aspirations}</Markdown></Block>
        </div>
      </div>
    </>
  );
}

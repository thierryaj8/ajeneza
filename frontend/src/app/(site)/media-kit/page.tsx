import Image from "@/components/content/Img";
import { Download, Mail } from "lucide-react";
import { CopyBlock } from "@/components/content/CopyBlock";
import { Markdown } from "@/components/content/Markdown";
import { SocialLinks } from "@/components/layout/Social";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import type { Profile, Settings } from "@/lib/types";

export const metadata = pageMeta({ title: "Media Kit", path: "/media-kit", description: "Biographies, portrait, roles, speaking topics and contact details for press and organisers." });

export default async function MediaKitPage() {
  const [p, s] = await Promise.all([api<Profile>("/profile", {}), api<Settings>("/settings", {})]);
  const portrait = s.mediaKit?.portraitUrl || p.portrait?.url;
  return (
    <>
      <PageHeader eyebrow="Press & organisers" title="Media kit" intro="Everything you need to introduce me: bios, portrait, roles, topics and contacts.">
        <div className="mt-8 flex flex-wrap gap-3">
          {s.mediaKit?.pdfUrl && <a href={s.mediaKit.pdfUrl} className="btn-primary" download><Download size={16} /> Download PDF profile</a>}
          {portrait && <a href={portrait} className="btn-secondary" download><Download size={16} /> Download portrait</a>}
        </div>
      </PageHeader>
      <div className="container grid gap-12 py-14 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section><h2 className="mb-4 text-2xl">Short biography</h2><CopyBlock text={p.shortBio ?? ""} /></section>
          <section><h2 className="mb-4 text-2xl">Full biography</h2><div className="card p-6"><Markdown>{p.fullBio}</Markdown></div></section>
          <section><h2 className="mb-4 text-2xl">Professional roles</h2><ul className="flex flex-wrap gap-2">{p.roles?.map((r) => <li key={r} className="chip text-sm">{r}</li>)}</ul></section>
          <section><h2 className="mb-4 text-2xl">Speaking topics</h2><ul className="list-disc space-y-1 pl-5">{p.speakingTopics?.map((t) => <li key={t.title}>{t.title}</li>)}</ul></section>
        </div>
        <aside className="space-y-6 lg:col-span-4">
          {portrait && <div className="relative aspect-[4/5] overflow-hidden rounded-2xl"><Image src={portrait} alt={`Portrait of ${p.name}`} fill sizes="33vw" className="object-cover" /></div>}
          <div className="card space-y-4 p-6">
            <h2 className="font-sans text-sm uppercase tracking-wider text-muted">Contact</h2>
            {s.contactEmail && <a href={`mailto:${s.contactEmail}`} className="flex items-center gap-2 font-medium text-heading hover:text-accent"><Mail size={16} /> {s.contactEmail}</a>}
            <SocialLinks links={s.socialLinks} className="text-heading" />
          </div>
        </aside>
      </div>
    </>
  );
}

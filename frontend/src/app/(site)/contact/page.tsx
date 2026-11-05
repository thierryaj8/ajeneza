import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/forms/ContactForm";
import { SocialLinks } from "@/components/layout/Social";
import { PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { INQUIRY_CATEGORIES } from "@/lib/site";
import type { Profile, Settings } from "@/lib/types";

export const metadata = pageMeta({ title: "Contact", path: "/contact", description: "Get in touch about collaboration, media, speaking, technology or publishing." });

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const [{ category }, settings, profile] = await Promise.all([searchParams, api<Settings>("/settings", {}), api<Profile>("/profile", {})]);
  return (
    <>
      <PageHeader eyebrow="Contact" title="Let's connect" intro="Business collaboration, media requests, speaking invitations, technology projects, publishing, or simply a good conversation." />
      <div className="container grid gap-12 py-14 lg:grid-cols-12">
        <div className="lg:col-span-8"><ContactForm defaultCategory={category && category in INQUIRY_CATEGORIES ? category : "general"} /></div>
        <aside className="space-y-6 lg:col-span-4">
          {settings.contactEmail && (
            <div className="flex gap-3"><Mail className="text-accent" size={20} /><div><p className="text-sm text-muted">Email</p><a href={`mailto:${settings.contactEmail}`} className="font-medium text-heading hover:text-accent">{settings.contactEmail}</a></div></div>
          )}
          {profile.location && (
            <div className="flex gap-3"><MapPin className="text-accent" size={20} /><div><p className="text-sm text-muted">Based in</p><p className="font-medium text-heading">{profile.location}</p></div></div>
          )}
          <div><p className="mb-3 text-sm text-muted">Elsewhere</p><SocialLinks links={settings.socialLinks} className="text-heading" /></div>
          <div className="card p-6 text-sm text-muted">For press and event organisers, the <a href="/media-kit" className="link">media kit</a> has bios, portraits and speaking topics.</div>
        </aside>
      </div>
    </>
  );
}

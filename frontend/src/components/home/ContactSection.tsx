import { ContactForm } from "@/components/forms/ContactForm";
import type { Profile, Settings } from "@/lib/types";

export function ContactSection({ settings, profile }: { settings: Settings; profile: Profile }) {
  return (
    <section id="contact" className="section bg-sand dark:bg-surface-2">
      <div className="wrap grid gap-10 md:grid-cols-[.85fr_1.15fr] md:gap-[75px]">
        <div>
          <p className="eyebrow">09 / Start a conversation</p>
          <h2 className="mb-4 mt-2 text-4xl leading-tight sm:text-[43px]">Good work begins with a conversation.</h2>
          <p className="text-sm leading-loose text-muted">For journalism, writing, technology projects, speaking invitations or thoughtful collaboration, I would be glad to hear from you.</p>
          {settings.contactEmail && (
            <div className="mt-6 border-t border-[#cfc4b4] py-3 text-[13px] text-[#34434a] dark:border-line dark:text-ink">
              Professional enquiries<br /><a href={`mailto:${settings.contactEmail}`} className="font-semibold hover:text-accent">{settings.contactEmail}</a>
            </div>
          )}
          {profile.location && (
            <div className="border-t border-[#cfc4b4] py-3 text-[13px] text-[#34434a] dark:border-line dark:text-ink">Based in<br /><strong>{profile.location}</strong></div>
          )}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

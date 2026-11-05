import Link from "next/link";
import { MORE_NAV, NAV, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import type { Settings } from "@/lib/types";
import { SocialLinks } from "./Social";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="bg-navy-900 pb-6 pt-12 text-[#e8e2d8]">
      <div className="wrap">
        <div className="flex flex-col justify-between gap-10 pb-9 md:flex-row">
          <div className="max-w-sm">
            <strong className="font-serif text-2xl font-normal">{SITE_NAME}</strong>
            <p className="mt-3 text-xs leading-loose text-silver">
              Exploring ideas, building technology, telling stories and contributing to a better future. A personal portfolio and journal.
            </p>
            <SocialLinks links={settings.socialLinks} className="mt-5 text-cream" />
          </div>
          <nav aria-label="Footer" className="flex max-w-xl flex-wrap content-start gap-x-5 gap-y-3">
            {[...NAV.slice(1), ...MORE_NAV].map((n) => (
              <Link key={n.href} href={n.href} className="text-[11px] uppercase tracking-[0.1em] text-silver-200 hover:text-gold-300">{n.label}</Link>
            ))}
            <Link href="/privacy" className="text-[11px] uppercase tracking-[0.1em] text-silver-200 hover:text-gold-300">Privacy</Link>
          </nav>
        </div>
        <div className="flex flex-col justify-between gap-2 border-t border-white/15 pt-4 text-[11px] text-[#8f9c9f] sm:flex-row">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>{SITE_TAGLINE}</span>
        </div>
      </div>
    </footer>
  );
}

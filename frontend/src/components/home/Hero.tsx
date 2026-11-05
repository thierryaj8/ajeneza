import Image from "@/components/content/Img";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import type { Profile, Settings } from "@/lib/types";
import { PortraitPlaceholder } from "./PortraitPlaceholder";

export function Hero({ settings, profile }: { settings: Settings; profile: Profile }) {
  const lede = settings.heroLede || `I am ${SITE_NAME}, ${profile.headline ?? "a journalist, author, software developer and Co-Founder of OrLabs Tech Industries."}`;
  return (
    <section className="relative overflow-hidden bg-navy text-cream">
      {/* Concentric gold rings, as in the template */}
      <div aria-hidden className="pointer-events-none absolute -right-36 -top-40 h-[440px] w-[440px] rounded-full border border-gold-300/15 shadow-[0_0_0_45px_rgba(214,185,142,.035),0_0_0_90px_rgba(214,185,142,.025)]" />
      <div className="wrap relative grid items-center gap-12 py-16 md:grid-cols-[1.12fr_.88fr] md:gap-16 md:py-24">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-gold-300">{settings.heroKicker ?? "A personal portfolio & journal"}</p>
          <h1 className="mt-6 max-w-[650px] font-serif text-[46px] leading-[1.02] tracking-[-0.045em] text-cream sm:text-6xl lg:text-[67px]">
            {settings.heroTitle ?? "Ideas that shape us."}
            <br />
            <em className="text-gold-300">{settings.heroHighlight ?? "Work that moves us."}</em>
          </h1>
          <p className="mt-5 max-w-[535px] text-[15px] leading-[1.9] text-silver-200">{lede}</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/about" className="btn border-gold bg-gold text-white hover:border-gold-600 hover:bg-gold-600">Discover my story</Link>
            <Link href="/blog" className="border-b border-gold-100/50 pb-1 text-[11px] uppercase tracking-[0.13em] text-gold-100">Read the journal&nbsp; ↗</Link>
          </div>
        </div>
        <div className="relative flex min-h-[320px] items-center justify-center md:min-h-[390px]">
          <div className="relative z-[1] aspect-[4/5] w-[250px] border border-gold-300/65 p-3 sm:w-[300px] lg:w-[355px]">
            {profile.portrait?.url ? (
              <div className="relative h-full w-full">
                <Image src={profile.portrait.url} alt={profile.portrait.alt || `Portrait of ${SITE_NAME}`} fill priority sizes="355px" className="object-cover" />
              </div>
            ) : <PortraitPlaceholder />}
          </div>
          <div className="absolute bottom-6 right-0 z-[2] bg-cream px-5 py-4 text-navy shadow-[0_8px_30px_rgba(0,0,0,.15)] md:-right-6">
            <strong className="block font-serif text-[17px] font-normal">{SITE_NAME}</strong>
            <small className="mt-1 block text-[9px] uppercase tracking-[0.15em] text-[#5a666b]">{settings.heroCaption ?? "Curious by nature. Building with purpose."}</small>
          </div>
        </div>
      </div>
    </section>
  );
}

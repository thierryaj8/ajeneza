import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

/** Diamond monogram + name, as in the template header. */
export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label={`${SITE_NAME}, home`}>
      <span aria-hidden className="grid h-9 w-9 rotate-45 place-items-center border border-gold-100/70 text-gold-100">
        <span className="-rotate-45 font-serif text-xl leading-none">A</span>
      </span>
      <span className="grid leading-tight">
        <strong className="whitespace-nowrap font-serif text-[15px] font-normal tracking-[0.035em] text-cream sm:text-[17px]">{SITE_NAME}</strong>
        <small className="mt-1 hidden text-[9px] sm:block uppercase tracking-[0.19em] text-silver">{SITE_TAGLINE}</small>
      </span>
    </Link>
  );
}

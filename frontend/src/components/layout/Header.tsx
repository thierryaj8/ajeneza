"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { MORE_NAV, NAV } from "@/lib/site";
import { cn } from "@/lib/format";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const links = NAV.slice(1, -1);

  return (
    <header className="relative z-40 border-b border-white/10 bg-navy text-cream">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-cream focus:px-3 focus:py-2 focus:text-navy">
        Skip to content
      </a>
      <div className="wrap flex min-h-[76px] items-center justify-between gap-6">
        <Brand />
        <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
          {links.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}
              className={cn("text-[11px] uppercase tracking-[0.1em] transition-colors", isActive(item.href) ? "text-gold-300" : "text-silver-200 hover:text-gold-300")}>
              {item.label}
            </Link>
          ))}
          <Link href="/contact" className="border border-gold-300/75 px-4 py-2.5 text-[11px] uppercase tracking-[0.1em] text-gold-100 hover:bg-white/5">Let&apos;s Connect</Link>
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/search" className="p-2 text-silver-200 hover:text-gold-300" aria-label="Search"><Search size={17} /></Link>
          <ThemeToggle className="text-silver-200 hover:bg-white/10 hover:text-gold-300" />
          <button type="button" className="ml-1 whitespace-nowrap border border-white/35 px-3 py-2 text-[11px] uppercase tracking-[0.1em] xl:hidden"
            onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav">
            {open ? "Close ×" : "Menu +"}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="absolute inset-x-0 top-full border-t border-white/15 bg-navy pb-6 xl:hidden">
          <ul className="wrap grid sm:grid-cols-2 sm:gap-x-8">
            {[...NAV, ...MORE_NAV].map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn("block border-b border-white/10 py-3 text-[12px] uppercase tracking-[0.1em]", isActive(item.href) ? "text-gold-300" : "text-silver-200")}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

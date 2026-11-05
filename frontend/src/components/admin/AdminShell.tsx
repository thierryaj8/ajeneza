"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  Activity, BarChart3, BookOpen, Briefcase, CalendarDays, Code2, ExternalLink, FileText, FlaskConical, Folder, History, Image as ImageIcon,
  LayoutDashboard, Library, LogOut, Mail, Menu, MessageSquare, Newspaper, Settings, Tags, Trophy, User, UserCog, Users, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/format";
import { adminFetch } from "./client";

export interface Me { id: string; name: string; email: string; role: "superadmin" | "editor" | "content_manager" }
const MeContext = createContext<Me | null>(null);
export const useMe = () => useContext(MeContext);

const NAV: { group: string; items: { href: string; label: string; icon: typeof User; roles?: Me["role"][] }[] }[] = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }, { href: "/admin/analytics", label: "Analytics", icon: BarChart3 }] },
  {
    group: "Content",
    items: [
      { href: "/admin/profile", label: "Biography", icon: User },
      { href: "/admin/c/journalism", label: "Journalism", icon: Newspaper },
      { href: "/admin/c/blog", label: "Blog", icon: FileText },
      { href: "/admin/c/books", label: "Books", icon: BookOpen },
      { href: "/admin/c/projects", label: "Projects", icon: Code2 },
      { href: "/admin/c/ventures", label: "Ventures", icon: Briefcase },
      { href: "/admin/c/events", label: "Leadership", icon: CalendarDays },
      { href: "/admin/c/achievements", label: "Achievements", icon: Trophy },
      { href: "/admin/c/timeline", label: "Timeline", icon: History },
      { href: "/admin/c/research", label: "Research", icon: FlaskConical },
      { href: "/admin/c/reading-list", label: "Reading room", icon: Library },
      { href: "/admin/c/categories", label: "Categories", icon: Folder },
      { href: "/admin/c/tags", label: "Tags", icon: Tags },
      { href: "/admin/media", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    group: "Audience",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Mail },
      { href: "/admin/comments", label: "Comments", icon: MessageSquare },
      { href: "/admin/subscribers", label: "Newsletter", icon: Users },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/settings", label: "Settings & SEO", icon: Settings, roles: ["superadmin"] },
      { href: "/admin/users", label: "Users", icon: UserCog, roles: ["superadmin"] },
      { href: "/admin/activity", label: "Activity log", icon: Activity },
      { href: "/admin/account", label: "My account", icon: User },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { adminFetch<{ user: Me }>("/auth/me").then((r) => setMe(r.user)).catch(() => {}); }, []);
  useEffect(() => setOpen(false), [pathname]);

  async function logout() {
    await adminFetch("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  if (!me) return <div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>;

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      <Link href="/admin" className="px-2 font-serif text-lg font-bold text-white">AJENEZA M. Thierry <span className="block font-sans text-[10px] uppercase tracking-[0.2em] text-gold-300">Content management</span></Link>
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-silver/70">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.filter((i) => !i.roles || i.roles.includes(me.role)).map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href} aria-current={active(href) ? "page" : undefined}
                  className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm", active(href) ? "bg-white/10 text-white" : "text-silver-200 hover:bg-white/5 hover:text-white")}>
                  <Icon size={16} /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <a href="/" target="_blank" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-silver-200 hover:text-white"><ExternalLink size={16} /> View website</a>
        <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-silver-200 hover:text-white"><LogOut size={16} /> Sign out</button>
      </div>
    </nav>
  );

  return (
    <MeContext.Provider value={me}>
      <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
        <aside className="fixed inset-y-0 left-0 hidden w-60 bg-navy lg:block">{sidebar}</aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setOpen(false)} />
            <aside className="relative h-full w-64 bg-navy">{sidebar}</aside>
          </div>
        )}
        <div className="lg:col-start-2">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur sm:px-6">
            <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <span className="hidden text-sm text-muted lg:block">Signed in as <strong className="text-heading">{me.name}</strong> · {me.role.replace("_", " ")}</span>
            <ThemeToggle />
          </header>
          <main className="px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </MeContext.Provider>
  );
}

export function AdminPage({ title, actions, children, description }: { title: string; description?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>
      {children}
    </div>
  );
}

export function Notice({ kind = "info", children, onClose }: { kind?: "info" | "error" | "success"; children: React.ReactNode; onClose?: () => void }) {
  const style = { info: "bg-surface-2 text-ink", error: "bg-red-100 text-red-900", success: "bg-emerald-100 text-emerald-900" }[kind];
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`mb-6 flex items-start justify-between gap-3 rounded-xl px-4 py-3 text-sm ${style}`}>
      <div>{children}</div>
      {onClose && <button onClick={onClose} aria-label="Dismiss"><X size={16} /></button>}
    </div>
  );
}

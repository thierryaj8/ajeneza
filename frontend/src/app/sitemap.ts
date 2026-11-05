export const dynamic = "force-dynamic";
import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { MORE_NAV, NAV, SITE_URL } from "@/lib/site";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { entries } = await api<{ entries: { path: string; updatedAt: string }[] }>("/sitemap", { entries: [] });
  const statics = [...NAV, ...MORE_NAV].filter((n) => n.href !== "/search").map((n) => ({
    url: `${SITE_URL}${n.href === "/" ? "" : n.href}`, changeFrequency: "weekly" as const, priority: n.href === "/" ? 1 : 0.7,
  }));
  return [...statics, ...entries.map((e) => ({ url: `${SITE_URL}${e.path}`, lastModified: e.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 }))];
}

export const dynamic = "force-dynamic";
import { list } from "@/lib/api";
import { SITE_URL } from "@/lib/site";
import type { Article } from "@/lib/types";

const esc = (s = "") => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const { items } = await list<Article>("articles", { limit: 30 });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>AJENEZA M. Thierry</title><link>${SITE_URL}</link><description>Journalism, essays and ideas by AJENEZA M. Thierry.</description><language>en</language>
${items.map((a) => `<item><title>${esc(a.title)}</title><link>${SITE_URL}/${a.section}/${a.slug}</link><guid>${SITE_URL}/${a.section}/${a.slug}</guid><pubDate>${new Date(a.publishedAt ?? a.createdAt).toUTCString()}</pubDate><description>${esc(a.excerpt || a.subtitle)}</description>${a.category ? `<category>${esc(a.category.name)}</category>` : ""}</item>`).join("\n")}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}

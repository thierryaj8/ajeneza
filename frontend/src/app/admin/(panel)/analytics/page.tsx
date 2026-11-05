"use client";
import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { DailyBars, RankList } from "@/components/admin/Charts";
import { adminFetch } from "@/components/admin/client";

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState<any>(null);
  useEffect(() => { adminFetch(`/admin/dashboard/analytics?days=${days}`).then(setD).catch(() => {}); }, [days]);
  const sum = (rows?: { count: number }[]) => (rows ?? []).reduce((s, r) => s + r.count, 0);
  return (
    <AdminPage title="Analytics" description="Cookieless, privacy-conscious statistics. No personal data is collected."
      actions={
        <div className="flex rounded-full border border-line p-1" role="group" aria-label="Time range">
          {[7, 30, 90, 365].map((n) => <button key={n} onClick={() => setDays(n)} aria-pressed={days === n} className={`rounded-full px-3 py-1 text-sm ${days === n ? "bg-accent text-accent-ink" : "text-muted"}`}>{n === 365 ? "1y" : `${n}d`}</button>)}
        </div>
      }>
      {d && (
        <>
          <ul className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[["Page views", d.totalViews], ["Avg / day", Math.round(d.totalViews / d.days)], ["New subscribers", sum(d.subscriptions)], ["Contact messages", sum(d.messages)]].map(([l, v]) => (
              <li key={l} className="card p-5"><p className="text-sm text-muted">{l}</p><p className="mt-1 text-3xl font-semibold tabular-nums text-heading">{v}</p></li>
            ))}
          </ul>
          <section className="card mb-6 p-6"><h2 className="mb-6 text-lg font-bold">Page views per day</h2><DailyBars data={d.series} label="Page views per day" /></section>
          <div className="grid gap-6 md:grid-cols-2">
            <RankList title="Most visited pages" rows={d.topPaths.map((p: any) => ({ label: p.path, value: p.views, href: p.path }))} />
            <RankList title="Traffic sources" rows={d.referrers.map((r: any) => ({ label: r.source, value: r.views }))} />
            <RankList title="Most read articles (all time)" rows={d.topArticles.map((a: any) => ({ label: a.title, value: a.views, href: `/${a.section}/${a.slug}` }))} />
            <RankList title="Most popular projects (all time)" rows={d.topProjects.map((p: any) => ({ label: p.title, value: p.views, href: `/projects/${p.slug}` }))} />
            <RankList title="Countries" rows={d.countries.map((c: any) => ({ label: c.country, value: c.views }))} empty="Country data appears when hosted behind Vercel or Cloudflare." />
          </div>
        </>
      )}
    </AdminPage>
  );
}

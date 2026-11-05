"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Code2, Eye, FileCheck2, FilePen, FileText, Mail, MessageSquare, Plus, Users } from "lucide-react";
import { AdminPage, Notice } from "@/components/admin/AdminShell";
import { DailyBars } from "@/components/admin/Charts";
import { adminFetch, errorText } from "@/components/admin/client";

interface Overview { counts: Record<string, number>; recentActivity: { _id: string; action: string; resource: string; summary?: string; createdAt: string; user?: { name: string } }[] }

export default function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [series, setSeries] = useState<{ day: string; views: number }[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    adminFetch<Overview>("/admin/dashboard/overview").then(setData).catch((e) => setError(errorText(e)));
    adminFetch<{ series: { day: string; views: number }[] }>("/admin/dashboard/analytics?days=30").then((r) => setSeries(r.series)).catch(() => {});
  }, []);
  const c = data?.counts ?? {};
  const tiles = [
    { label: "Total articles", value: c.totalArticles, icon: FileText, href: "/admin/c/blog" },
    { label: "Published", value: c.publishedArticles, icon: FileCheck2 },
    { label: "Drafts", value: c.draftArticles, icon: FilePen, note: c.reviewArticles ? `${c.reviewArticles} in review` : undefined },
    { label: "Projects", value: c.totalProjects, icon: Code2, href: "/admin/c/projects" },
    { label: "Books", value: c.totalBooks, icon: BookOpen, href: "/admin/c/books" },
    { label: "Subscribers", value: c.subscribers, icon: Users, href: "/admin/subscribers" },
    { label: "Messages", value: c.messages, icon: Mail, href: "/admin/messages", note: c.newMessages ? `${c.newMessages} new` : undefined },
    { label: "Visits (30 days)", value: c.visits30, icon: Eye, href: "/admin/analytics" },
  ];
  return (
    <AdminPage title="Dashboard" description="An overview of your website."
      actions={<><Link href="/admin/c/blog/new" className="btn-primary"><Plus size={16} /> New post</Link><Link href="/admin/c/projects/new" className="btn-secondary"><Plus size={16} /> New project</Link></>}>
      {error && <Notice kind="error">{error}</Notice>}
      {!!c.pendingComments && <Notice><Link href="/admin/comments" className="font-medium underline"><MessageSquare size={14} className="mr-1 inline" />{c.pendingComments} comment(s) awaiting moderation</Link></Notice>}
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map(({ label, value, icon: Icon, href, note }) => {
          const inner = (
            <>
              <div className="flex items-center justify-between text-muted"><span className="text-sm">{label}</span><Icon size={16} /></div>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-heading">{value ?? "–"}</p>
              {note && <p className="mt-1 text-xs font-medium text-accent">{note}</p>}
            </>
          );
          return <li key={label}>{href ? <Link href={href} className="card block p-5 hover:border-accent">{inner}</Link> : <div className="card p-5">{inner}</div>}</li>;
        })}
      </ul>
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold">Page views, last 30 days</h2>
          {series.length ? <DailyBars data={series} label="Page views per day" /> : <p className="text-sm text-muted">No data yet.</p>}
        </section>
        <section className="card p-6">
          <h2 className="mb-4 text-lg font-bold">Recent activity</h2>
          <ul className="space-y-3 text-sm">
            {data?.recentActivity.map((a) => (
              <li key={a._id}>
                <p><span className="font-medium text-heading">{a.user?.name ?? "System"}</span> {a.action.replace("_", " ")} <span className="text-muted">{a.resource}</span></p>
                {a.summary && <p className="truncate text-muted">{a.summary}</p>}
                <p className="text-xs text-muted">{new Date(a.createdAt).toLocaleString()}</p>
              </li>
            ))}
            {data && !data.recentActivity.length && <li className="text-muted">No activity yet.</li>}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}

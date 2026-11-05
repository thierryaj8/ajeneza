"use client";
import { useEffect, useState } from "react";
import { AdminPage } from "@/components/admin/AdminShell";
import { adminFetch } from "@/components/admin/client";

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  useEffect(() => { adminFetch(`/admin/activity?limit=50&page=${page}`).then(setData).catch(() => {}); }, [page]);
  return (
    <AdminPage title="Activity log" description="Every administrative action, newest first.">
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-muted"><tr><th className="px-4 py-3">When</th><th className="px-4 py-3">Who</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Item</th></tr></thead>
          <tbody className="divide-y divide-line">
            {data?.items.map((a: any) => (
              <tr key={a._id}><td className="whitespace-nowrap px-4 py-2.5 text-muted">{new Date(a.createdAt).toLocaleString()}</td><td className="px-4 py-2.5">{a.user?.name ?? "–"}</td><td className="px-4 py-2.5">{a.action.replace("_", " ")} <span className="text-muted">{a.resource}</span></td><td className="px-4 py-2.5">{a.summary}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      {data?.pages > 1 && (
        <div className="mt-4 flex justify-end gap-2"><button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Newer</button><button className="btn-secondary" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Older</button></div>
      )}
    </AdminPage>
  );
}

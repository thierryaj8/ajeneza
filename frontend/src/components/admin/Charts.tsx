"use client";
import { useState } from "react";

/** Single-series daily bar chart. One hue (brand accent), 2px gaps, rounded data ends, hover tooltip, table fallback. */
export function DailyBars({ data, label }: { data: { day: string; views: number }[]; label: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.views));
  const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return (
    <figure>
      <div className="relative h-48" role="img" aria-label={`${label}: bar chart, ${data.length} days, peak ${max}`}>
        <div className="absolute inset-0 flex items-end gap-[2px]">
          {data.map((d, i) => (
            <div key={d.day} className="group relative flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <div className={`w-full rounded-t-[4px] ${hover === i ? "bg-accent" : "bg-accent/75"}`} style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 2 : 0 }} />
            </div>
          ))}
        </div>
        {hover !== null && (
          <div className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-surface px-3 py-1.5 text-xs shadow" style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}>
            <p className="text-muted">{fmt(data[hover].day)}</p>
            <p className="font-semibold text-heading">{data[hover].views} views</p>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between border-t border-line pt-1 text-xs text-muted">
        <span>{data[0] && fmt(data[0].day)}</span><span>{data.at(-1) && fmt(data.at(-1)!.day)}</span>
      </div>
      <details className="mt-2 text-xs"><summary className="cursor-pointer text-muted">Show as table</summary>
        <table className="mt-2 w-full"><tbody>{data.map((d) => <tr key={d.day}><td className="py-0.5">{d.day}</td><td className="text-right">{d.views}</td></tr>)}</tbody></table>
      </details>
    </figure>
  );
}

export function RankList({ title, rows, empty = "No data yet." }: { title: string; rows: { label: string; value: number; href?: string }[]; empty?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="card p-5">
      <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted">{title}</h2>
      {rows.length ? (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li key={r.label} className="relative overflow-hidden rounded-md px-2 py-1.5 text-sm">
              <div className="absolute inset-y-0 left-0 rounded-md bg-accent/10" style={{ width: `${(r.value / max) * 100}%` }} aria-hidden />
              <div className="relative flex justify-between gap-3">
                {r.href ? <a href={r.href} target="_blank" className="truncate hover:text-accent">{r.label}</a> : <span className="truncate">{r.label}</span>}
                <span className="font-medium tabular-nums text-heading">{r.value}</span>
              </div>
            </li>
          ))}
        </ul>
      ) : <p className="text-sm text-muted">{empty}</p>}
    </div>
  );
}

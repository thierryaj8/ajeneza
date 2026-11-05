export function formatDate(d?: string | Date, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", opts);
}
export const yearOf = (d?: string) => (d ? new Date(d).getFullYear() : "");
export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

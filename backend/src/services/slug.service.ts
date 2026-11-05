import type { Model } from "mongoose";

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "") // "Africa's" -> "africas"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "item";
}

/** Returns a slug that is unique within `scope` (e.g. { section: "blog" }). */
export async function uniqueSlug(model: Model<any>, base: string, scope: Record<string, unknown> = {}, excludeId?: string) {
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i < 500; i++) {
    const clash = await model.exists({ ...scope, slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) });
    if (!clash) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

export const CONTENT_STATUSES = ["draft", "in_review", "scheduled", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Prisma filter for content a visitor may see: published or already scheduled. */
export function visibleFilter(now = new Date()) {
  return { OR: [{ status: "published" }, { status: "scheduled", publishAt: { lte: now } }] };
}

export function readingTimeMinutes(text = ""): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}


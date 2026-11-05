import { Schema } from "mongoose";

export const CONTENT_STATUSES = ["draft", "in_review", "scheduled", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const imageSchema = new Schema({ url: { type: String, required: true }, alt: { type: String, default: "" } }, { _id: false });
export const linkSchema = new Schema({ label: { type: String, required: true }, url: { type: String, required: true } }, { _id: false });
export const seoSchema = new Schema(
  { title: String, description: String, ogImage: String, canonical: String, noindex: { type: Boolean, default: false } },
  { _id: false },
);

/** Fields shared by every publishable content type. */
export const publishable = {
  status: { type: String, enum: CONTENT_STATUSES, default: "draft", index: true },
  publishAt: { type: Date },
  publishedAt: { type: Date, index: true },
  featured: { type: Boolean, default: false, index: true },
  seo: { type: seoSchema, default: () => ({}) },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
};

/** Mongo filter for content a visitor may see: published, or scheduled with a publish time in the past. */
export function visibleFilter(now = new Date()) {
  return { $or: [{ status: "published" }, { status: "scheduled", publishAt: { $lte: now } }] };
}

export function readingTimeMinutes(text = ""): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Keep publishedAt in sync with status changes. */
export function stampPublished(doc: { status?: string; publishAt?: Date | null; publishedAt?: Date | null }) {
  if (doc.status === "published" && !doc.publishedAt) doc.publishedAt = new Date();
  if (doc.status === "scheduled" && doc.publishAt) doc.publishedAt = doc.publishAt;
}

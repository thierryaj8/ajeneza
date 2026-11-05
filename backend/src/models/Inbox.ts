import { Schema, model } from "mongoose";

export const INQUIRY_CATEGORIES = ["business", "media", "speaking", "technology", "publishing", "general"] as const;

const contactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    organization: String,
    subject: { type: String, required: true },
    message: { type: String, required: true },
    category: { type: String, enum: INQUIRY_CATEGORIES, default: "general" },
    status: { type: String, enum: ["new", "read", "replied", "archived", "spam"], default: "new", index: true },
  },
  { timestamps: true },
);
export const ContactMessage = model("ContactMessage", contactSchema, "contact_messages");

const subscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: String,
    status: { type: String, enum: ["active", "unsubscribed"], default: "active", index: true },
    source: String,
  },
  { timestamps: true },
);
export const Subscriber = model("Subscriber", subscriberSchema);

const commentSchema = new Schema(
  {
    article: { type: Schema.Types.ObjectId, ref: "Article", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, select: false },
    body: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved", "spam"], default: "pending", index: true },
  },
  { timestamps: true },
);
export const Comment = model("Comment", commentSchema);

const mediaSchema = new Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    provider: { type: String, enum: ["local", "cloudinary", "embed"], required: true },
    providerId: String,
    kind: { type: String, enum: ["image", "pdf", "document", "video"], required: true, index: true },
    mimeType: String,
    size: Number,
    width: Number,
    height: Number,
    alt: { type: String, default: "" },
    folder: { type: String, default: "general", index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);
mediaSchema.index({ name: "text", alt: "text", folder: "text" });
export const Media = model("Media", mediaSchema, "media");

const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resource: String,
    resourceId: String,
    summary: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export const ActivityLog = model("ActivityLog", activitySchema, "activity_logs");

/** Privacy-conscious page view: no IP, no cookie, no user agent. Country only. */
const pageViewSchema = new Schema(
  {
    path: { type: String, required: true, index: true },
    referrerHost: String,
    country: String,
    day: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
export const PageView = model("PageView", pageViewSchema, "page_views");

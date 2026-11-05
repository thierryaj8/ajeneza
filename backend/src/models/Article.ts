import { Schema, model } from "mongoose";
import { imageSchema, publishable, readingTimeMinutes, stampPublished } from "./common.js";

/** Journalism reports and blog posts share one collection, split by `section`. */
const articleSchema = new Schema(
  {
    section: { type: String, enum: ["journalism", "blog"], required: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    slug: { type: String, required: true },
    excerpt: { type: String, default: "" },
    body: { type: String, default: "" },
    coverImage: { type: imageSchema },
    category: { type: Schema.Types.ObjectId, ref: "Category", index: true },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
    sources: [{ title: String, url: String }],
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    allowComments: { type: Boolean, default: true },
    ...publishable,
  },
  { timestamps: true },
);
articleSchema.index({ section: 1, slug: 1 }, { unique: true });
articleSchema.index({ title: "text", subtitle: "text", excerpt: "text", body: "text" });
articleSchema.pre("save", function () {
  this.readingTime = readingTimeMinutes(this.body);
  stampPublished(this);
});

export const Article = model("Article", articleSchema);

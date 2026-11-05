import { Schema, model } from "mongoose";
import { imageSchema, publishable, readingTimeMinutes, stampPublished } from "./common.js";

export const TIMELINE_CATEGORIES = ["education", "career", "company", "publication", "project", "leadership", "achievement"] as const;
export const EVENT_TYPES = ["speaking", "conference", "mentorship", "community", "workshop"] as const;

const achievementSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    issuer: String,
    date: Date,
    link: String,
    ...publishable,
  },
  { timestamps: true },
);
achievementSchema.pre("save", function () { stampPublished(this); });
export const Achievement = model("Achievement", achievementSchema);

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: EVENT_TYPES, default: "speaking" },
    date: Date,
    location: String,
    organizer: String,
    topic: String,
    description: { type: String, default: "" },
    images: [imageSchema],
    link: String,
    ...publishable,
  },
  { timestamps: true },
);
eventSchema.pre("save", function () { stampPublished(this); });
export const Event = model("Event", eventSchema);

const timelineSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, enum: TIMELINE_CATEGORIES, default: "career" },
    date: { type: Date, required: true },
    endDate: Date,
    organization: String,
    description: { type: String, default: "" },
    link: String,
    ...publishable,
  },
  { timestamps: true },
);
timelineSchema.pre("save", function () { stampPublished(this); });
export const TimelineEntry = model("TimelineEntry", timelineSchema, "timeline");

const researchSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["research", "experiment", "observation", "insight"], default: "insight" },
    abstract: { type: String, default: "" },
    body: { type: String, default: "" },
    coverImage: { type: imageSchema },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
    attachments: [{ label: String, url: String }],
    readingTime: { type: Number, default: 1 },
    ...publishable,
  },
  { timestamps: true },
);
researchSchema.pre("save", function () {
  this.readingTime = readingTimeMinutes(this.body);
  stampPublished(this);
});
export const Research = model("Research", researchSchema, "research");

const readingSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    author: { type: String, default: "" },
    type: { type: String, enum: ["book", "paper", "essay", "article", "report"], default: "book" },
    url: String,
    note: { type: String, default: "" },
    coverImage: { type: imageSchema },
    shelf: { type: String, enum: ["recommended", "reading", "influential"], default: "recommended" },
    ...publishable,
  },
  { timestamps: true },
);
readingSchema.pre("save", function () { stampPublished(this); });
export const ReadingItem = model("ReadingItem", readingSchema, "reading_list");

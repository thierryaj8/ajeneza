import { Schema, model } from "mongoose";
import { imageSchema, publishable, stampPublished } from "./common.js";

export const PROJECT_CATEGORIES = [
  "web", "mobile", "ai", "ml", "cloud", "devops", "research", "open_source",
] as const;
export const DEV_STATUSES = ["planning", "in_development", "completed", "maintenance", "archived"] as const;

const projectSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    problem: { type: String, default: "" },
    objectives: [String],
    features: [String],
    technologies: [String],
    categories: [{ type: String, enum: PROJECT_CATEGORIES }],
    images: [imageSchema],
    devStatus: { type: String, enum: DEV_STATUSES, default: "planning" },
    githubUrl: String,
    liveUrl: String,
    docsUrl: String,
    dateCreated: Date,
    views: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    ...publishable,
  },
  { timestamps: true },
);
projectSchema.index({ title: "text", summary: "text", description: "text", technologies: "text" });
projectSchema.pre("save", function () { stampPublished(this); });

export const Project = model("Project", projectSchema);

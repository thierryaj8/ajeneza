import { Schema, model } from "mongoose";
import { imageSchema, publishable, stampPublished } from "./common.js";

const ventureSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    role: { type: String, default: "" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    services: [{ title: String, description: String }],
    solutions: [String],
    products: [{ name: String, description: String, url: String }],
    achievements: [String],
    collaboration: { type: String, default: "" },
    website: String,
    socialLinks: [{ platform: String, url: String }],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    logo: { type: imageSchema },
    foundedYear: Number,
    order: { type: Number, default: 0 },
    ...publishable,
  },
  { timestamps: true },
);
ventureSchema.pre("save", function () { stampPublished(this); });

export const Venture = model("Venture", ventureSchema);

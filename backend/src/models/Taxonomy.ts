import { Schema, model } from "mongoose";

export const SECTIONS = ["journalism", "blog", "research"] as const;

const categorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
    section: { type: String, enum: SECTIONS, required: true },
    description: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);
categorySchema.index({ section: 1, slug: 1 }, { unique: true });
export const Category = model("Category", categorySchema);

const tagSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true } }, { timestamps: true });
export const Tag = model("Tag", tagSchema);

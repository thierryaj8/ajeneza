import { Schema, model } from "mongoose";
import { imageSchema, linkSchema, publishable } from "./common.js";
import { stampPublished } from "./common.js";

export const BOOK_PUBLICATION = ["published", "upcoming", "in_progress"] as const;

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    slug: { type: String, required: true, unique: true },
    kind: { type: String, enum: ["book", "essay", "short_story", "reflection"], default: "book" },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    coverImage: { type: imageSchema },
    publicationStatus: { type: String, enum: BOOK_PUBLICATION, default: "upcoming" },
    publisher: String,
    publicationDate: Date,
    isbn: String,
    pages: Number,
    genre: String,
    excerpts: [{ title: String, body: String }],
    recommendations: [{ quote: String, source: String }],
    purchaseLinks: [linkSchema],
    downloadUrl: String,
    order: { type: Number, default: 0 },
    ...publishable,
  },
  { timestamps: true },
);
bookSchema.pre("save", function () { stampPublished(this); });

export const Book = model("Book", bookSchema);

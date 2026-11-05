import { Schema, model } from "mongoose";

/** Singleton document: site identity, social links, Now page and SEO defaults. */
const settingsSchema = new Schema(
  {
    siteTitle: { type: String, default: "AJENEZA M. Thierry" },
    titleTemplate: { type: String, default: "%s | AJENEZA M. Thierry" },
    // Homepage hero (editable in Admin → Settings)
    heroKicker: { type: String, default: "A personal portfolio & journal" },
    heroTitle: { type: String, default: "Ideas that shape us." },
    heroHighlight: { type: String, default: "Work that moves us." },
    heroLede: { type: String, default: "" },
    heroCaption: { type: String, default: "Curious by nature. Building with purpose." },
    tagline: { type: String, default: "Technology. Journalism. Literature. Leadership." },
    heroQuote: {
      type: String,
      default: "Exploring ideas. Building solutions. Telling stories. Creating impact.",
    },
    description: {
      type: String,
      default: "Journalist, author, software developer and Co-Founder of OrLabs Tech Industries.",
    },
    contactEmail: String,
    socialLinks: [{ platform: String, url: String }],
    now: {
      building: { type: String, default: "" },
      learning: { type: String, default: "" },
      reading: { type: String, default: "" },
      interests: { type: String, default: "" },
      activities: { type: String, default: "" },
      updatedAt: Date,
    },
    mediaKit: { pdfUrl: String, portraitUrl: String },
    defaultOgImage: String,
    analyticsEnabled: { type: Boolean, default: true },
    commentsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Settings = model("Settings", settingsSchema);

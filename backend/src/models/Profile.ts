import { Schema, model } from "mongoose";
import { imageSchema } from "./common.js";

/** Singleton document holding the biography (About page, media kit). */
const profileSchema = new Schema(
  {
    name: { type: String, default: "AJENEZA M. Thierry" },
    headline: { type: String, default: "" },
    roles: [String],
    shortBio: { type: String, default: "" },
    fullBio: { type: String, default: "" },
    story: { type: String, default: "" },
    education: [{ institution: String, qualification: String, period: String, notes: String }],
    journey: { type: String, default: "" },
    careerInterests: [String],
    philosophy: { type: String, default: "" },
    vision: { type: String, default: "" },
    mission: { type: String, default: "" },
    skills: [{ group: String, items: [String] }],
    languages: [{ name: String, level: String }],
    aspirations: { type: String, default: "" },
    leadershipBio: { type: String, default: "" },
    speakingTopics: [{ title: String, description: String }],
    portrait: { type: imageSchema },
    location: String,
    email: String,
  },
  { timestamps: true },
);

export const Profile = model("Profile", profileSchema);

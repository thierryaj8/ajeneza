"use client";
import { SingletonForm, type Transform } from "@/components/admin/SingletonForm";

// Skills are stored as { group, items: string[] }; edit items as a comma-separated string.
const skillsTransform: Transform = {
  load: (d) => ({ ...d, skills: (d.skills ?? []).map((s: any) => ({ group: s.group, items: (s.items ?? []).join(", ") })) }),
  save: (p) => ({ ...p, skills: (p.skills ?? []).map((s: any) => ({ group: s.group ?? "", items: String(s.items ?? "").split(",").map((x) => x.trim()).filter(Boolean) })) }),
};

export default function ProfileAdmin() {
  return (
    <SingletonForm title="Biography" description="Powers the About page, homepage introduction, leadership page and media kit." path="/admin/profile" transform={skillsTransform} sections={[
      { title: "Identity", fields: [
        { name: "name", label: "Name", type: "text" },
        { name: "location", label: "Location", type: "text" },
        { name: "headline", label: "Headline", type: "text", wide: true },
        { name: "roles", label: "Professional roles", type: "list", help: "One per line." },
        { name: "email", label: "Public email", type: "text" },
        { name: "portrait", label: "Professional portrait", type: "image" },
      ] },
      { title: "Biography", fields: [
        { name: "shortBio", label: "Short biography", type: "textarea", wide: true, help: "Two or three sentences. Used on the homepage and media kit." },
        { name: "fullBio", label: "Personal biography", type: "markdown" },
        { name: "story", label: "My story", type: "markdown" },
        { name: "journey", label: "Professional journey", type: "markdown" },
      ] },
      { title: "Education", fields: [
        { name: "education", label: "Educational background", type: "objects", fields: [{ name: "qualification", label: "Qualification" }, { name: "institution", label: "Institution" }, { name: "period", label: "Period (e.g. 2018 – 2022)" }, { name: "notes", label: "Notes", type: "textarea" }] },
      ] },
      { title: "Philosophy, vision and mission", fields: [
        { name: "philosophy", label: "Personal philosophy", type: "markdown" },
        { name: "vision", label: "Vision", type: "textarea" },
        { name: "mission", label: "Mission", type: "textarea" },
        { name: "aspirations", label: "Future aspirations", type: "markdown" },
      ] },
      { title: "Skills, languages and interests", fields: [
        { name: "careerInterests", label: "Career interests", type: "list", help: "One per line." },
        { name: "languages", label: "Languages", type: "objects", fields: [{ name: "name", label: "Language" }, { name: "level", label: "Level" }] },
        { name: "skills", label: "Skills (group, then items separated by commas)", type: "objects", fields: [{ name: "group", label: "Group" }, { name: "items", label: "Items, comma separated" }], wide: true },
      ] },
      { title: "Leadership and speaking", fields: [
        { name: "leadershipBio", label: "Leadership biography", type: "markdown" },
        { name: "speakingTopics", label: "Speaking topics", type: "objects", fields: [{ name: "title", label: "Topic" }, { name: "description", label: "Description", type: "textarea" }] },
      ] },
    ]} />
  );
}

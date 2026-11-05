/** Site-wide constants. The owner's name is set once here. */
export const SITE_NAME = "AJENEZA M. Thierry";
export const SITE_TAGLINE = "Ideas · Innovation · Impact";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/journalism", label: "Journalism" },
  { href: "/projects", label: "Technology" },
  { href: "/ventures", label: "Ventures" },
  { href: "/books", label: "Books" },
  { href: "/leadership", label: "Leadership" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
] as const;

export const MORE_NAV = [
  { href: "/timeline", label: "Timeline" },
  { href: "/research", label: "Research & Insights" },
  { href: "/reading-room", label: "Reading Room" },
  { href: "/now", label: "Now" },
  { href: "/media-kit", label: "Media Kit" },
  { href: "/search", label: "Search" },
] as const;

export const PROJECT_CATEGORIES: Record<string, string> = {
  web: "Web Development", mobile: "Mobile Development", ai: "Artificial Intelligence", ml: "Machine Learning",
  cloud: "Cloud Computing", devops: "DevOps", research: "Research & Innovation", open_source: "Open Source",
};
export const DEV_STATUS: Record<string, string> = {
  planning: "Planning", in_development: "In Development", completed: "Completed", maintenance: "Maintenance", archived: "Archived",
};
export const BOOK_STATUS: Record<string, string> = { published: "Published", upcoming: "Upcoming", in_progress: "In progress" };
export const TIMELINE_CATEGORIES: Record<string, string> = {
  education: "Education", career: "Career", company: "Company", publication: "Publication", project: "Project", leadership: "Leadership", achievement: "Achievement",
};
export const INQUIRY_CATEGORIES: Record<string, string> = {
  general: "General conversation", media: "Journalism & media", technology: "Technology project", business: "OrLabs Tech Industries / business",
  speaking: "Speaking invitation", publishing: "Books & publishing",
};

export * from "./common.js";

export const ROLES = ["superadmin", "editor", "content_manager"] as const;
export type Role = (typeof ROLES)[number];

export const SECTIONS = ["journalism", "blog", "research"] as const;
export const BOOK_PUBLICATION = ["published", "upcoming", "in_progress"] as const;
export const PROJECT_CATEGORIES = ["web", "mobile", "ai", "ml", "cloud", "devops", "research", "open_source"] as const;
export const DEV_STATUSES = ["planning", "in_development", "completed", "maintenance", "archived"] as const;
export const TIMELINE_CATEGORIES = ["education", "career", "company", "publication", "project", "leadership", "achievement"] as const;
export const EVENT_TYPES = ["speaking", "conference", "mentorship", "community", "workshop"] as const;
export const INQUIRY_CATEGORIES = ["business", "media", "speaking", "technology", "publishing", "general"] as const;

import { BOOK_STATUS, DEV_STATUS, PROJECT_CATEGORIES, TIMELINE_CATEGORIES } from "@/lib/site";

export type Field =
  | { name: string; label: string; type: "text" | "textarea" | "markdown" | "number" | "date" | "url"; help?: string; required?: boolean; wide?: boolean }
  | { name: string; label: string; type: "select"; options: Record<string, string>; help?: string; wide?: boolean }
  | { name: string; label: string; type: "checkboxes"; options: Record<string, string>; help?: string; wide?: boolean }
  | { name: string; label: string; type: "boolean"; help?: string; wide?: boolean }
  | { name: string; label: string; type: "list"; help?: string; wide?: boolean }
  | { name: string; label: string; type: "image"; help?: string; wide?: boolean }
  | { name: string; label: string; type: "images"; help?: string; wide?: boolean }
  | { name: string; label: string; type: "objects"; fields: { name: string; label: string; type?: "text" | "textarea" | "url" }[]; help?: string; wide?: boolean }
  | { name: string; label: string; type: "category"; section: string; help?: string; wide?: boolean }
  | { name: string; label: string; type: "refs"; resource: string; help?: string; wide?: boolean };

export interface ResourceConfig {
  key: string;            // URL key in the admin
  api: string;            // API collection
  label: string;          // plural
  singular: string;
  preset?: Record<string, unknown>;
  publicPath?: (item: any) => string;
  publishable: boolean;
  columns: { name: string; label: string; format?: (v: any, item: any) => string }[];
  fields: Field[];
}

const links = { type: "objects" as const, fields: [{ name: "label", label: "Label" }, { name: "url", label: "URL", type: "url" as const }] };
const date = (v?: string) => (v ? new Date(v).toLocaleDateString("en-GB") : "–");

const articleFields = (section: string): Field[] => [
  { name: "title", label: "Headline", type: "text", required: true, wide: true },
  { name: "subtitle", label: "Subtitle", type: "text", wide: true },
  { name: "excerpt", label: "Excerpt", type: "textarea", help: "Shown on listings and in search results.", wide: true },
  { name: "coverImage", label: "Featured image", type: "image", wide: true },
  { name: "body", label: "Article body", type: "markdown", wide: true },
  { name: "category", label: "Category", type: "category", section },
  { name: "tags", label: "Tags", type: "refs", resource: "tags" },
  { name: "sources", label: "Sources and references", ...{ type: "objects", fields: [{ name: "title", label: "Title" }, { name: "url", label: "URL", type: "url" }] }, wide: true } as Field,
  { name: "allowComments", label: "Allow comments", type: "boolean" },
];

export const RESOURCES: ResourceConfig[] = [
  {
    key: "journalism", api: "articles", label: "Journalism", singular: "report", preset: { section: "journalism" }, publishable: true,
    publicPath: (i) => `/journalism/${i.slug}`,
    columns: [{ name: "title", label: "Headline" }, { name: "category", label: "Category", format: (c) => c?.name ?? "–" }, { name: "publishedAt", label: "Published", format: date }, { name: "views", label: "Views" }],
    fields: articleFields("journalism"),
  },
  {
    key: "blog", api: "articles", label: "Blog", singular: "post", preset: { section: "blog" }, publishable: true,
    publicPath: (i) => `/blog/${i.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "category", label: "Category", format: (c) => c?.name ?? "–" }, { name: "publishedAt", label: "Published", format: date }, { name: "views", label: "Views" }],
    fields: articleFields("blog"),
  },
  {
    key: "books", api: "books", label: "Books", singular: "book", publishable: true, publicPath: (i) => `/books/${i.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "publicationStatus", label: "Publication", format: (v) => BOOK_STATUS[v] ?? v }, { name: "kind", label: "Kind" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "subtitle", label: "Subtitle", type: "text", wide: true },
      { name: "kind", label: "Kind", type: "select", options: { book: "Book", essay: "Essay", short_story: "Short story", reflection: "Reflection" } },
      { name: "publicationStatus", label: "Publication status", type: "select", options: BOOK_STATUS },
      { name: "coverImage", label: "Cover image", type: "image", wide: true },
      { name: "summary", label: "Short description", type: "textarea", wide: true },
      { name: "description", label: "Full description", type: "markdown", wide: true },
      { name: "genre", label: "Genre", type: "text" },
      { name: "publisher", label: "Publisher", type: "text" },
      { name: "publicationDate", label: "Publication date", type: "date" },
      { name: "isbn", label: "ISBN", type: "text" },
      { name: "pages", label: "Pages", type: "number" },
      { name: "order", label: "Sort order", type: "number" },
      { name: "excerpts", label: "Excerpts", type: "objects", fields: [{ name: "title", label: "Title" }, { name: "body", label: "Text", type: "textarea" }], wide: true },
      { name: "recommendations", label: "Reader recommendations", type: "objects", fields: [{ name: "quote", label: "Quote", type: "textarea" }, { name: "source", label: "Source" }], wide: true },
      { name: "purchaseLinks", label: "Purchase links", ...links, wide: true },
      { name: "downloadUrl", label: "Authorised download URL", type: "url", help: "Only for publications you are allowed to distribute.", wide: true },
    ],
  },
  {
    key: "projects", api: "projects", label: "Projects", singular: "project", publishable: true, publicPath: (i) => `/projects/${i.slug}`,
    columns: [{ name: "title", label: "Project" }, { name: "devStatus", label: "Development", format: (v) => DEV_STATUS[v] ?? v }, { name: "views", label: "Views" }],
    fields: [
      { name: "title", label: "Project name", type: "text", required: true, wide: true },
      { name: "summary", label: "Short description", type: "textarea", wide: true },
      { name: "images", label: "Project images", type: "images", help: "The first image is the cover.", wide: true },
      { name: "problem", label: "Problem statement", type: "markdown", wide: true },
      { name: "description", label: "Project description", type: "markdown", wide: true },
      { name: "objectives", label: "Objectives", type: "list", help: "One per line." },
      { name: "features", label: "Features", type: "list", help: "One per line." },
      { name: "technologies", label: "Technologies used", type: "list", help: "One per line." },
      { name: "categories", label: "Categories", type: "checkboxes", options: PROJECT_CATEGORIES },
      { name: "devStatus", label: "Development status", type: "select", options: DEV_STATUS },
      { name: "dateCreated", label: "Date created", type: "date" },
      { name: "githubUrl", label: "GitHub repository", type: "url" },
      { name: "liveUrl", label: "Live demonstration", type: "url" },
      { name: "docsUrl", label: "Documentation", type: "url" },
      { name: "order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "ventures", api: "ventures", label: "Ventures", singular: "venture", publishable: true, publicPath: (i) => `/ventures/${i.slug}`,
    columns: [{ name: "title", label: "Name" }, { name: "role", label: "Role" }],
    fields: [
      { name: "title", label: "Name", type: "text", required: true, wide: true },
      { name: "role", label: "Your role", type: "text" },
      { name: "foundedYear", label: "Founded (year)", type: "number" },
      { name: "logo", label: "Logo", type: "image", wide: true },
      { name: "summary", label: "Introduction (short)", type: "textarea", wide: true },
      { name: "description", label: "Company introduction", type: "markdown", wide: true },
      { name: "mission", label: "Mission", type: "markdown" },
      { name: "vision", label: "Vision", type: "markdown" },
      { name: "services", label: "Services", type: "objects", fields: [{ name: "title", label: "Service" }, { name: "description", label: "Description", type: "textarea" }], wide: true },
      { name: "solutions", label: "Technology solutions", type: "list" },
      { name: "achievements", label: "Company achievements", type: "list", help: "Verified achievements only." },
      { name: "products", label: "Products", type: "objects", fields: [{ name: "name", label: "Name" }, { name: "description", label: "Description", type: "textarea" }, { name: "url", label: "URL", type: "url" }], wide: true },
      { name: "projects", label: "Related portfolio projects", type: "refs", resource: "projects", wide: true },
      { name: "collaboration", label: "Collaboration opportunities", type: "markdown", wide: true },
      { name: "website", label: "Official website", type: "url" },
      { name: "socialLinks", label: "Social media accounts", type: "objects", fields: [{ name: "platform", label: "Platform" }, { name: "url", label: "URL", type: "url" }], wide: true },
      { name: "order", label: "Sort order", type: "number" },
    ],
  },
  {
    key: "events", api: "events", label: "Leadership & events", singular: "event", publishable: true,
    columns: [{ name: "title", label: "Event" }, { name: "type", label: "Type" }, { name: "date", label: "Date", format: date }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "type", label: "Type", type: "select", options: { speaking: "Speaking", conference: "Conference", mentorship: "Mentorship", community: "Community", workshop: "Workshop" } },
      { name: "date", label: "Date", type: "date" },
      { name: "location", label: "Location", type: "text" },
      { name: "organizer", label: "Organizer", type: "text" },
      { name: "topic", label: "Topic", type: "text", wide: true },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "images", label: "Photographs", type: "images", wide: true },
      { name: "link", label: "Link", type: "url", wide: true },
    ],
  },
  {
    key: "achievements", api: "achievements", label: "Achievements", singular: "achievement", publishable: true,
    columns: [{ name: "title", label: "Achievement" }, { name: "issuer", label: "Issuer" }, { name: "date", label: "Date", format: date }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "issuer", label: "Issuer / organisation", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "link", label: "Evidence link", type: "url", wide: true },
    ],
  },
  {
    key: "timeline", api: "timeline", label: "Timeline", singular: "milestone", publishable: true,
    columns: [{ name: "title", label: "Milestone" }, { name: "category", label: "Category", format: (v) => TIMELINE_CATEGORIES[v] ?? v }, { name: "date", label: "Date", format: date }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "category", label: "Category", type: "select", options: TIMELINE_CATEGORIES },
      { name: "organization", label: "Organisation", type: "text" },
      { name: "date", label: "Start date", type: "date", required: true },
      { name: "endDate", label: "End date", type: "date" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "link", label: "Link", type: "url", wide: true },
    ],
  },
  {
    key: "research", api: "research", label: "Research", singular: "research note", publishable: true, publicPath: (i) => `/research/${i.slug}`,
    columns: [{ name: "title", label: "Title" }, { name: "kind", label: "Kind" }, { name: "publishedAt", label: "Published", format: date }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "kind", label: "Kind", type: "select", options: { research: "Research", experiment: "Experiment", observation: "Observation", insight: "Insight" } },
      { name: "abstract", label: "Abstract", type: "textarea", wide: true },
      { name: "coverImage", label: "Cover image", type: "image", wide: true },
      { name: "body", label: "Body", type: "markdown", wide: true },
      { name: "attachments", label: "Attachments", ...links, wide: true },
      { name: "tags", label: "Tags", type: "refs", resource: "tags" },
    ],
  },
  {
    key: "reading-list", api: "reading-list", label: "Reading room", singular: "reading item", publishable: true,
    columns: [{ name: "title", label: "Title" }, { name: "author", label: "Author" }, { name: "shelf", label: "Shelf" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, wide: true },
      { name: "author", label: "Author", type: "text" },
      { name: "type", label: "Type", type: "select", options: { book: "Book", paper: "Paper", essay: "Essay", article: "Article", report: "Report" } },
      { name: "shelf", label: "Shelf", type: "select", options: { recommended: "Recommended", reading: "Currently reading", influential: "Influential" } },
      { name: "url", label: "Link", type: "url" },
      { name: "note", label: "Why it matters", type: "textarea", wide: true },
      { name: "coverImage", label: "Cover", type: "image", wide: true },
    ],
  },
  {
    key: "categories", api: "categories", label: "Categories", singular: "category", publishable: false,
    columns: [{ name: "name", label: "Name" }, { name: "section", label: "Section" }, { name: "slug", label: "Slug" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "section", label: "Section", type: "select", options: { journalism: "Journalism", blog: "Blog", research: "Research" } },
      { name: "slug", label: "Slug", type: "text", help: "Leave blank to generate from the name." },
      { name: "order", label: "Sort order", type: "number" },
      { name: "description", label: "Description", type: "textarea", wide: true },
    ],
  },
  {
    key: "tags", api: "tags", label: "Tags", singular: "tag", publishable: false,
    columns: [{ name: "name", label: "Name" }, { name: "slug", label: "Slug" }],
    fields: [{ name: "name", label: "Name", type: "text", required: true }, { name: "slug", label: "Slug", type: "text" }],
  },
];

export const resourceByKey = (key: string) => RESOURCES.find((r) => r.key === key);

export const STATUS_LABEL: Record<string, string> = { draft: "Draft", in_review: "In review", scheduled: "Scheduled", published: "Published", archived: "Archived" };
export const STATUS_STYLE: Record<string, string> = {
  draft: "bg-surface-2 text-muted", in_review: "bg-amber-100 text-amber-900", scheduled: "bg-violet-100 text-violet-900",
  published: "bg-emerald-100 text-emerald-900", archived: "bg-zinc-200 text-zinc-700",
};

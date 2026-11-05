import { z } from "zod";
import {
  BOOK_PUBLICATION, CONTENT_STATUSES, DEV_STATUSES, EVENT_TYPES, INQUIRY_CATEGORIES,
  PROJECT_CATEGORIES, SECTIONS, TIMELINE_CATEGORIES,
} from "../models/index.js";

/** Only http(s) URLs or site-relative paths; blocks javascript:, data: and friends. */
export const safeUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === "" || /^https?:\/\//i.test(v) || (v.startsWith("/") && !v.startsWith("//")), {
    message: "Must be an http(s) URL or a site path",
  });

const str = (max = 300) => z.string().trim().max(max);
const longText = z.string().max(200_000);
const optDate = z.union([z.coerce.date(), z.literal(""), z.null()]).optional().transform((v) => (v ? v : undefined));
const objectId = z.string().uuid("Invalid id");
const image = z.object({ url: safeUrl, alt: str(300).default("") });
const link = z.object({ label: str(120), url: safeUrl });
const strList = z.array(str(300)).max(100);

const seo = z
  .object({ title: str(160), description: str(320), ogImage: safeUrl, canonical: safeUrl, noindex: z.boolean() })
  .partial();

const publishable = {
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens").max(160).optional().or(z.literal("")),
  status: z.enum(CONTENT_STATUSES).optional(),
  publishAt: optDate,
  featured: z.boolean().optional(),
  seo: seo.optional(),
};

export const schemas = {
  article: z.object({
    section: z.enum(["journalism", "blog"]),
    title: str(200).min(1),
    subtitle: str(300).optional(),
    excerpt: str(600).optional(),
    body: longText.optional(),
    coverImage: image.nullable().optional(),
    category: objectId.nullable().optional().or(z.literal("")),
    tags: z.array(objectId).max(30).optional(),
    sources: z.array(z.object({ title: str(300), url: safeUrl })).max(100).optional(),
    allowComments: z.boolean().optional(),
    ...publishable,
  }),
  book: z.object({
    title: str(200).min(1),
    subtitle: str(300).optional(),
    kind: z.enum(["book", "essay", "short_story", "reflection"]).optional(),
    summary: str(600).optional(),
    description: longText.optional(),
    coverImage: image.nullable().optional(),
    publicationStatus: z.enum(BOOK_PUBLICATION).optional(),
    publisher: str().optional(),
    publicationDate: optDate,
    isbn: str(40).optional(),
    pages: z.coerce.number().int().min(0).max(100000).optional(),
    genre: str().optional(),
    excerpts: z.array(z.object({ title: str(), body: longText })).max(50).optional(),
    recommendations: z.array(z.object({ quote: str(2000), source: str() })).max(50).optional(),
    purchaseLinks: z.array(link).max(20).optional(),
    downloadUrl: safeUrl.optional(),
    order: z.coerce.number().optional(),
    ...publishable,
  }),
  project: z.object({
    title: str(200).min(1),
    summary: str(600).optional(),
    description: longText.optional(),
    problem: longText.optional(),
    objectives: strList.optional(),
    features: strList.optional(),
    technologies: strList.optional(),
    categories: z.array(z.enum(PROJECT_CATEGORIES)).optional(),
    images: z.array(image).max(40).optional(),
    devStatus: z.enum(DEV_STATUSES).optional(),
    githubUrl: safeUrl.optional(),
    liveUrl: safeUrl.optional(),
    docsUrl: safeUrl.optional(),
    dateCreated: optDate,
    order: z.coerce.number().optional(),
    ...publishable,
  }),
  venture: z.object({
    title: str(200).min(1),
    role: str().optional(),
    summary: str(600).optional(),
    description: longText.optional(),
    mission: longText.optional(),
    vision: longText.optional(),
    services: z.array(z.object({ title: str(), description: str(2000) })).max(50).optional(),
    solutions: strList.optional(),
    products: z.array(z.object({ name: str(), description: str(2000), url: safeUrl })).max(50).optional(),
    achievements: strList.optional(),
    collaboration: longText.optional(),
    website: safeUrl.optional(),
    socialLinks: z.array(z.object({ platform: str(60), url: safeUrl })).max(20).optional(),
    projects: z.array(objectId).max(100).optional(),
    logo: image.nullable().optional(),
    foundedYear: z.coerce.number().int().min(1900).max(2200).optional(),
    order: z.coerce.number().optional(),
    ...publishable,
  }),
  achievement: z.object({
    title: str(200).min(1),
    description: longText.optional(),
    issuer: str().optional(),
    date: optDate,
    link: safeUrl.optional(),
    ...publishable,
  }),
  event: z.object({
    title: str(200).min(1),
    type: z.enum(EVENT_TYPES).optional(),
    date: optDate,
    location: str().optional(),
    organizer: str().optional(),
    topic: str().optional(),
    description: longText.optional(),
    images: z.array(image).max(40).optional(),
    link: safeUrl.optional(),
    ...publishable,
  }),
  timeline: z.object({
    title: str(200).min(1),
    category: z.enum(TIMELINE_CATEGORIES).optional(),
    date: z.coerce.date(),
    endDate: optDate,
    organization: str().optional(),
    description: longText.optional(),
    link: safeUrl.optional(),
    ...publishable,
  }),
  research: z.object({
    title: str(200).min(1),
    kind: z.enum(["research", "experiment", "observation", "insight"]).optional(),
    abstract: str(2000).optional(),
    body: longText.optional(),
    coverImage: image.nullable().optional(),
    category: objectId.nullable().optional().or(z.literal("")),
    tags: z.array(objectId).max(30).optional(),
    attachments: z.array(link).max(30).optional(),
    ...publishable,
  }),
  reading: z.object({
    title: str(200).min(1),
    author: str().optional(),
    type: z.enum(["book", "paper", "essay", "article", "report"]).optional(),
    url: safeUrl.optional(),
    note: longText.optional(),
    coverImage: image.nullable().optional(),
    shelf: z.enum(["recommended", "reading", "influential"]).optional(),
    ...publishable,
  }),
  category: z.object({
    name: str(80).min(1),
    slug: publishable.slug,
    section: z.enum(SECTIONS),
    description: str(500).optional(),
    order: z.coerce.number().optional(),
  }),
  tag: z.object({ name: str(60).min(1), slug: publishable.slug }),
  profile: z
    .object({
      name: str(120),
      headline: str(300),
      roles: strList,
      shortBio: str(2000),
      fullBio: longText,
      story: longText,
      education: z.array(z.object({ institution: str(), qualification: str(), period: str(80), notes: str(2000) }).partial()).max(30),
      journey: longText,
      careerInterests: strList,
      philosophy: longText,
      vision: longText,
      mission: longText,
      skills: z.array(z.object({ group: str(80), items: strList })).max(30),
      languages: z.array(z.object({ name: str(60), level: str(60) })).max(30),
      aspirations: longText,
      leadershipBio: longText,
      speakingTopics: z.array(z.object({ title: str(), description: str(2000) })).max(30),
      portrait: image.nullable(),
      location: str(),
      email: z.union([z.email(), z.literal("")]),
    })
    .partial(),
  settings: z
    .object({
      siteTitle: str(120),
      titleTemplate: str(160),
      heroKicker: str(120),
      heroTitle: str(160),
      heroHighlight: str(160),
      heroLede: str(800),
      heroCaption: str(160),
      tagline: str(200),
      heroQuote: str(400),
      description: str(400),
      contactEmail: z.union([z.email(), z.literal("")]),
      socialLinks: z.array(z.object({ platform: str(60), url: safeUrl })).max(20),
      now: z.object({ building: longText, learning: longText, reading: longText, interests: longText, activities: longText }).partial(),
      mediaKit: z.object({ pdfUrl: safeUrl, portraitUrl: safeUrl }).partial(),
      defaultOgImage: safeUrl,
      analyticsEnabled: z.boolean(),
      commentsEnabled: z.boolean(),
    })
    .partial(),
  contact: z.object({
    name: str(120).min(1),
    email: z.email().max(200),
    organization: str(200).optional().default(""),
    subject: str(200).min(1),
    message: z.string().trim().min(10).max(5000),
    category: z.enum(INQUIRY_CATEGORIES).default("general"),
    website: z.string().max(0).optional().default(""), // honeypot: must stay empty
  }),
  subscribe: z.object({
    email: z.email().max(200),
    name: str(120).optional(),
    source: str(80).optional(),
    website: z.string().max(0).optional().default(""),
  }),
  comment: z.object({
    name: str(80).min(1),
    email: z.email().max(200),
    body: z.string().trim().min(2).max(3000),
    website: z.string().max(0).optional().default(""),
  }),
  login: z.object({ email: z.email(), password: z.string().min(1).max(200) }),
  user: z.object({
    name: str(120).min(1),
    email: z.email(),
    password: z.string().min(12).max(200),
    role: z.enum(["superadmin", "editor", "content_manager"]),
  }),
  password: z.object({ currentPassword: z.string().min(1), newPassword: z.string().min(12).max(200) }),
  track: z.object({ path: z.string().max(500).startsWith("/"), referrer: z.string().max(2048).optional() }),
};

import type { Model } from "mongoose";
import type { ZodObject } from "zod";
import {
  Achievement, Article, Book, Category, Event, Project, ReadingItem, Research, Tag, TimelineEntry, Venture,
} from "../models/index.js";
import { schemas } from "../validators/index.js";

export interface ResourceDef {
  /** URL segment, e.g. "articles" */
  name: string;
  model: Model<any>;
  schema: ZodObject<any>;
  /** Field the slug is derived from */
  titleField: "title" | "name";
  /** Fields that scope slug uniqueness (articles are unique per section) */
  slugScope?: string[];
  /** Whether the model has the publishable workflow (status/publishAt/featured) */
  publishable: boolean;
  /** Default sort for public listings */
  publicSort: Record<string, 1 | -1>;
  populate?: { path: string; select: string }[];
  /** Fields hidden from public responses */
  searchFields: string[];
}

export const resources: Record<string, ResourceDef> = {
  articles: {
    name: "articles", model: Article, schema: schemas.article, titleField: "title", slugScope: ["section"], publishable: true,
    publicSort: { publishedAt: -1 },
    populate: [{ path: "category", select: "name slug section" }, { path: "tags", select: "name slug" }, { path: "author", select: "name" }],
    searchFields: ["title", "subtitle", "excerpt"],
  },
  books: { name: "books", model: Book, schema: schemas.book, titleField: "title", publishable: true, publicSort: { order: 1, publicationDate: -1 }, searchFields: ["title", "subtitle", "summary"] },
  projects: { name: "projects", model: Project, schema: schemas.project, titleField: "title", publishable: true, publicSort: { featured: -1, order: 1, dateCreated: -1 }, searchFields: ["title", "summary", "technologies"] },
  ventures: {
    name: "ventures", model: Venture, schema: schemas.venture, titleField: "title", publishable: true, publicSort: { featured: -1, order: 1 },
    populate: [{ path: "projects", select: "title slug summary devStatus status" }], searchFields: ["title", "summary"],
  },
  achievements: { name: "achievements", model: Achievement, schema: schemas.achievement, titleField: "title", publishable: true, publicSort: { date: -1 }, searchFields: ["title", "issuer"] },
  events: { name: "events", model: Event, schema: schemas.event, titleField: "title", publishable: true, publicSort: { date: -1 }, searchFields: ["title", "location", "topic"] },
  timeline: { name: "timeline", model: TimelineEntry, schema: schemas.timeline, titleField: "title", publishable: true, publicSort: { date: -1 }, searchFields: ["title", "organization"] },
  research: {
    name: "research", model: Research, schema: schemas.research, titleField: "title", publishable: true, publicSort: { publishedAt: -1 },
    populate: [{ path: "category", select: "name slug section" }, { path: "tags", select: "name slug" }], searchFields: ["title", "abstract"],
  },
  "reading-list": { name: "reading-list", model: ReadingItem, schema: schemas.reading, titleField: "title", publishable: true, publicSort: { shelf: 1, createdAt: -1 }, searchFields: ["title", "author"] },
  categories: { name: "categories", model: Category, schema: schemas.category, titleField: "name", slugScope: ["section"], publishable: false, publicSort: { order: 1, name: 1 }, searchFields: ["name"] },
  tags: { name: "tags", model: Tag, schema: schemas.tag, titleField: "name", publishable: false, publicSort: { name: 1 }, searchFields: ["name"] },
};

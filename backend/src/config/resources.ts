import { prisma } from "./db.js";
import { schemas } from "../validators/index.js";
import type { ZodObject } from "zod";

type SortOrder = "asc" | "desc";

export interface ResourceDef {
  name: string;
  model: any;
  schema: ZodObject<any>;
  titleField: "title" | "name";
  slugScope?: string[];
  publishable: boolean;
  publicSort: Record<string, SortOrder>;
  include?: Record<string, unknown>;
  filterFields: string[];
  searchFields: string[];
}

export const resources: Record<string, ResourceDef> = {
  articles: {
    name: "articles", model: prisma.article, schema: schemas.article, titleField: "title", slugScope: ["section"], publishable: true,
    publicSort: { publishedAt: "desc" },
    include: { category: true, tags: { include: { tag: true } }, author: { select: { id: true, name: true } } },
    filterFields: ["section", "kind", "type"], searchFields: ["title", "subtitle", "excerpt"],
  },
  books: {
    name: "books", model: prisma.book, schema: schemas.book, titleField: "title", publishable: true,
    publicSort: { order: "asc", publicationDate: "desc" }, filterFields: ["kind", "publicationStatus"], searchFields: ["title", "subtitle", "summary"],
  },
  projects: {
    name: "projects", model: prisma.project, schema: schemas.project, titleField: "title", publishable: true,
    publicSort: { featured: "desc", order: "asc", dateCreated: "desc" }, filterFields: ["devStatus"], searchFields: ["title", "summary", "description"],
  },
  ventures: {
    name: "ventures", model: prisma.venture, schema: schemas.venture, titleField: "title", publishable: true,
    publicSort: { featured: "desc", order: "asc" }, include: { projects: { include: { project: true } } },
    filterFields: [], searchFields: ["title", "summary"],
  },
  achievements: {
    name: "achievements", model: prisma.achievement, schema: schemas.achievement, titleField: "title", publishable: true,
    publicSort: { date: "desc" }, filterFields: [], searchFields: ["title", "issuer"],
  },
  events: {
    name: "events", model: prisma.event, schema: schemas.event, titleField: "title", publishable: true,
    publicSort: { date: "desc" }, filterFields: ["type"], searchFields: ["title", "location", "topic"],
  },
  timeline: {
    name: "timeline", model: prisma.timelineEntry, schema: schemas.timeline, titleField: "title", publishable: true,
    publicSort: { date: "desc" }, filterFields: ["category"], searchFields: ["title", "organization"],
  },
  research: {
    name: "research", model: prisma.research, schema: schemas.research, titleField: "title", publishable: true,
    publicSort: { publishedAt: "desc" }, include: { category: true, tags: { include: { tag: true } } },
    filterFields: ["kind"], searchFields: ["title", "abstract"],
  },
  "reading-list": {
    name: "reading-list", model: prisma.readingItem, schema: schemas.reading, titleField: "title", publishable: true,
    publicSort: { shelf: "asc", createdAt: "desc" }, filterFields: ["type", "shelf"], searchFields: ["title", "author"],
  },
  categories: {
    name: "categories", model: prisma.category, schema: schemas.category, titleField: "name", slugScope: ["section"], publishable: false,
    publicSort: { order: "asc", name: "asc" }, filterFields: ["section"], searchFields: ["name"],
  },
  tags: {
    name: "tags", model: prisma.tag, schema: schemas.tag, titleField: "name", publishable: false,
    publicSort: { name: "asc" }, filterFields: [], searchFields: ["name"],
  },
};

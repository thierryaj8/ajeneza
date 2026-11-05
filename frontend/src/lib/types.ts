export type Status = "draft" | "in_review" | "scheduled" | "published" | "archived";
export interface Img { url: string; alt?: string }
export interface Seo { title?: string; description?: string; ogImage?: string; canonical?: string; noindex?: boolean }
interface Base { _id: string; slug: string; status: Status; featured?: boolean; publishedAt?: string; publishAt?: string; seo?: Seo; createdAt: string; updatedAt: string }

export interface Category { _id: string; name: string; slug: string; section: "journalism" | "blog" | "research"; description?: string }
export interface Tag { _id: string; name: string; slug: string }

export interface Article extends Base {
  section: "journalism" | "blog";
  title: string; subtitle?: string; excerpt?: string; body?: string;
  coverImage?: Img; category?: Category; tags?: Tag[]; author?: { name: string };
  sources?: { title: string; url: string }[]; readingTime: number; views: number; allowComments?: boolean;
}
export interface Book extends Base {
  title: string; subtitle?: string; kind: string; summary?: string; description?: string; coverImage?: Img;
  publicationStatus: "published" | "upcoming" | "in_progress"; publisher?: string; publicationDate?: string; isbn?: string;
  pages?: number; genre?: string; excerpts?: { title: string; body: string }[]; recommendations?: { quote: string; source: string }[];
  purchaseLinks?: { label: string; url: string }[]; downloadUrl?: string;
}
export interface Project extends Base {
  title: string; summary?: string; description?: string; problem?: string; objectives?: string[]; features?: string[];
  technologies?: string[]; categories?: string[]; images?: Img[]; devStatus: string; githubUrl?: string; liveUrl?: string;
  docsUrl?: string; dateCreated?: string;
}
export interface Venture extends Base {
  title: string; role?: string; summary?: string; description?: string; mission?: string; vision?: string;
  services?: { title: string; description?: string }[]; solutions?: string[]; products?: { name: string; description?: string; url?: string }[];
  achievements?: string[]; collaboration?: string; website?: string; socialLinks?: { platform: string; url: string }[];
  projects?: Pick<Project, "_id" | "title" | "slug" | "summary" | "devStatus" | "status">[]; logo?: Img; foundedYear?: number;
}
export interface Achievement extends Base { title: string; description?: string; issuer?: string; date?: string; link?: string }
export interface EventItem extends Base { title: string; type: string; date?: string; location?: string; organizer?: string; topic?: string; description?: string; images?: Img[]; link?: string }
export interface TimelineEntry extends Base { title: string; category: string; date: string; endDate?: string; organization?: string; description?: string; link?: string }
export interface Research extends Base { title: string; kind: string; abstract?: string; body?: string; coverImage?: Img; category?: Category; tags?: Tag[]; attachments?: { label: string; url: string }[]; readingTime: number }
export interface ReadingItem extends Base { title: string; author?: string; type: string; url?: string; note?: string; coverImage?: Img; shelf: string }

export interface Profile {
  name?: string; headline?: string; roles?: string[]; shortBio?: string; fullBio?: string; story?: string;
  education?: { institution?: string; qualification?: string; period?: string; notes?: string }[];
  journey?: string; careerInterests?: string[]; philosophy?: string; vision?: string; mission?: string;
  skills?: { group: string; items: string[] }[]; languages?: { name: string; level: string }[]; aspirations?: string;
  leadershipBio?: string; speakingTopics?: { title: string; description?: string }[]; portrait?: Img; location?: string; email?: string;
}
export interface Settings {
  siteTitle?: string; titleTemplate?: string; heroKicker?: string; heroTitle?: string; heroHighlight?: string; heroLede?: string; heroCaption?: string; tagline?: string; heroQuote?: string; description?: string; contactEmail?: string;
  socialLinks?: { platform: string; url: string }[];
  now?: { building?: string; learning?: string; reading?: string; interests?: string; activities?: string; updatedAt?: string };
  mediaKit?: { pdfUrl?: string; portraitUrl?: string }; defaultOgImage?: string; analyticsEnabled?: boolean; commentsEnabled?: boolean;
}
export interface Paged<T> { items: T[]; total: number; page: number; pages: number }

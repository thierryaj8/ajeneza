import type { Metadata } from "next";
import type { Seo } from "./types";
import { SITE_URL } from "./site";

/** Builds page metadata with canonical URL, Open Graph and Twitter cards. */
export function pageMeta(opts: { title: string; description?: string; path: string; image?: string; seo?: Seo; type?: "website" | "article"; publishedTime?: string }): Metadata {
  const title = opts.seo?.title || opts.title;
  const description = opts.seo?.description || opts.description || undefined;
  const image = opts.seo?.ogImage || opts.image;
  const canonical = opts.seo?.canonical || `${SITE_URL}${opts.path}`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: opts.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title, description, url: canonical, type: opts.type ?? "website", siteName: "AJENEZA M. Thierry",
      images: image ? [{ url: image }] : undefined, publishedTime: opts.publishedTime,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify output is escaped for "<" so content cannot close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

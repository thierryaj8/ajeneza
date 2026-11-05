import type { Metadata } from "next";
import { ArticleDetailPage, getArticle } from "@/components/content/ArticleViews";
import { pageMeta } from "@/lib/seo";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticle("journalism", slug);
  if (!a) return { title: "Not found" };
  return pageMeta({ title: a.title, description: a.excerpt || a.subtitle, path: "/journalism/" + a.slug, image: a.coverImage?.url, seo: a.seo, type: "article", publishedTime: a.publishedAt });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticleDetailPage section="journalism" slug={(await params).slug} />;
}

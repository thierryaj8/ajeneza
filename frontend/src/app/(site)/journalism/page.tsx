import { ArticleListPage, type ListParams } from "@/components/content/ArticleViews";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Journalism & Media", path: "/journalism", description: "Articles by AJENEZA M. Thierry." });

export default async function Page({ searchParams }: { searchParams: Promise<ListParams> }) {
  return <ArticleListPage section="journalism" params={await searchParams} />;
}

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { NewsletterBand } from "@/components/layout/NewsletterBand";
import { Tracker } from "@/components/layout/Tracker";
import { api } from "@/lib/api";
import type { Settings } from "@/lib/types";

// Pages always show the latest published content from the CMS.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await api<Settings>("/settings", {});
  return (
    <>
      <Header />
      <main id="main">{children}</main>
      <NewsletterBand />
      <Footer settings={settings} />
      {settings.analyticsEnabled !== false && <Tracker />}
    </>
  );
}

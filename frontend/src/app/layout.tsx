import type { Metadata, Viewport } from "next";
import { themeInitScript } from "@/components/layout/ThemeToggle";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Journalist, Author, Developer and Co-Founder`, template: `%s | ${SITE_NAME}` },
  description: `The personal portfolio, journal and digital home of ${SITE_NAME}: journalist, author, technology enthusiast and Co-Founder of OrLabs Tech Industries.`,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en" },
  alternates: { types: { "application/rss+xml": "/feed.xml" } },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#172a3a" },
    { media: "(prefers-color-scheme: dark)", color: "#101f2b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

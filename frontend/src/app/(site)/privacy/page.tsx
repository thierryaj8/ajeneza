import { PageHeader } from "@/components/ui";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Privacy", path: "/privacy", description: "How this website handles your data." });

export default function PrivacyPage() {
  return (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy notice" />
      <div className="container max-w-3xl py-12">
        <div className="prose prose-site lg:prose-lg">
          <p><em>Placeholder notice. Review with the site owner before launch.</em></p>
          <h2>Analytics</h2>
          <p>This site counts page views without cookies. For each visit it records only the page path, the referring website&apos;s domain and an approximate country. It does not store IP addresses, device fingerprints or any identifier that could follow you across visits. If your browser sends a Do Not Track or Global Privacy Control signal, nothing is recorded.</p>
          <h2>Contact form, newsletter and comments</h2>
          <p>When you send a message, subscribe or comment, the details you enter are stored so that I can reply, send the newsletter or display your comment. Comment email addresses are never published. You can unsubscribe at any time, or ask for your data to be deleted through the contact page.</p>
          <h2>Cookies</h2>
          <p>Public pages set no cookies. The only cookies are the secure session cookies used by the private admin area. Your light or dark theme choice is saved in your browser&apos;s local storage.</p>
        </div>
      </div>
    </>
  );
}

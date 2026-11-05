"use client";
import { SingletonForm } from "@/components/admin/SingletonForm";

export default function SettingsAdmin() {
  return (
    <SingletonForm title="Settings & SEO" description="Website identity, social links, Now page, media kit and defaults." path="/admin/settings" sections={[
      { title: "Website identity", fields: [
        { name: "siteTitle", label: "Site title", type: "text" },
        { name: "tagline", label: "Tagline", type: "text" },
        { name: "heroKicker", label: "Hero kicker (small line above the title)", type: "text", wide: true },
        { name: "heroTitle", label: "Hero title, first line", type: "text" },
        { name: "heroHighlight", label: "Hero title, italic gold line", type: "text" },
        { name: "heroLede", label: "Hero introduction paragraph", type: "textarea", wide: true },
        { name: "heroCaption", label: "Caption under the portrait", type: "text", wide: true },
        { name: "heroQuote", label: "Quote strip under the hero", type: "textarea", wide: true },
        { name: "description", label: "Default meta description", type: "textarea", wide: true },
        { name: "defaultOgImage", label: "Default social sharing image URL", type: "url", wide: true },
        { name: "contactEmail", label: "Contact email", type: "text" },
      ] },
      { title: "Social media", fields: [
        { name: "socialLinks", label: "Profiles", type: "objects", help: "Platform names like LinkedIn, X, GitHub, YouTube get matching icons.", fields: [{ name: "platform", label: "Platform" }, { name: "url", label: "URL", type: "url" }] },
      ] },
      { title: "Now page", fields: [
        { name: "now.building", label: "What I am currently building", type: "markdown" },
        { name: "now.learning", label: "What I am learning", type: "markdown" },
        { name: "now.reading", label: "What I am reading", type: "markdown" },
        { name: "now.interests", label: "Current interests", type: "markdown" },
        { name: "now.activities", label: "Ongoing professional activities", type: "markdown" },
      ] },
      { title: "Media kit", fields: [
        { name: "mediaKit.pdfUrl", label: "Downloadable PDF profile URL", type: "url", help: "Upload the PDF in the media library, then paste its URL." },
        { name: "mediaKit.portraitUrl", label: "High-resolution portrait URL", type: "url" },
      ] },
      { title: "Features", fields: [
        { name: "analyticsEnabled", label: "Privacy-friendly analytics enabled", type: "boolean" },
        { name: "commentsEnabled", label: "Reader comments enabled", type: "boolean" },
      ] },
    ]} />
  );
}

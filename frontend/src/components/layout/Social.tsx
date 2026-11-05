import { Facebook, Github, Globe, Instagram, Linkedin, Mail, Twitter, Youtube } from "lucide-react";

const ICONS: Record<string, typeof Globe> = { linkedin: Linkedin, x: Twitter, twitter: Twitter, github: Github, facebook: Facebook, instagram: Instagram, youtube: Youtube, email: Mail };

export function SocialLinks({ links = [], className = "" }: { links?: { platform: string; url: string }[]; className?: string }) {
  if (!links.length) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => {
        const Icon = ICONS[l.platform.toLowerCase()] ?? Globe;
        return (
          <li key={l.url + l.platform}>
            <a href={l.url} target="_blank" rel="noopener noreferrer me" aria-label={l.platform} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-current/20 opacity-80 transition hover:opacity-100">
              <Icon size={16} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

import Image from "@/components/content/Img";
import { BookOpen, Code2, Newspaper } from "lucide-react";
import type { Img } from "@/lib/types";

const ICONS = { article: Newspaper, project: Code2, book: BookOpen };

/** Responsive cover image, with a branded placeholder when no image is set. */
export function Cover({ image, title, kind = "article", className = "", sizes = "(min-width: 1024px) 33vw, 100vw", priority = false }: {
  image?: Img; title: string; kind?: keyof typeof ICONS; className?: string; sizes?: string; priority?: boolean;
}) {
  if (image?.url) {
    return (
      <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
        <Image src={image.url} alt={image.alt || ""} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const Icon = ICONS[kind];
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-navy via-navy-700 to-gold-600 ${className}`} aria-hidden>
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      <Icon className="relative text-white/70" size={36} strokeWidth={1.25} />
      <span className="sr-only">{title}</span>
    </div>
  );
}

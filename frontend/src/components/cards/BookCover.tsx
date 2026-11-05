import Image from "@/components/content/Img";
import type { Book } from "@/lib/types";

const VARIANTS = [
  "bg-navy text-[#e9ddca] border-l-[#b18d5d]",
  "bg-[#46535a] text-[#e9ddca] border-l-[#b18d5d]",
  "bg-[#ded4c3] text-[#263744] border-l-[#8c6a40]",
];

/** Typographic book cover from the template, or the uploaded cover image. */
export function BookCover({ book, variant = 0, author, className = "h-[145px]" }: { book: Book; variant?: number; author: string; className?: string }) {
  if (book.coverImage?.url) {
    return (
      <div className={`relative aspect-[2/3] shadow-[5px_6px_0_#d9d0c1] ${className}`}>
        <Image src={book.coverImage.url} alt={book.coverImage.alt || `Cover of ${book.title}`} fill sizes="200px" className="object-cover" />
      </div>
    );
  }
  const title = book.title.replace(/^\[[^\]]*\]\s*/, "");
  return (
    <div aria-hidden className={`flex flex-col justify-between border-l-[5px] px-2.5 py-3 shadow-[5px_6px_0_#d9d0c1] dark:shadow-[5px_6px_0_rgba(0,0,0,.3)] ${VARIANTS[variant % VARIANTS.length]} ${className}`}>
      <small className="text-[7px] uppercase tracking-[0.15em]">{author}</small>
      <strong className="font-serif text-lg font-normal leading-[1.05]">{title}</strong>
      <small className="text-[7px] uppercase tracking-[0.15em]">{book.genre ?? "Writing & reflection"}</small>
    </div>
  );
}

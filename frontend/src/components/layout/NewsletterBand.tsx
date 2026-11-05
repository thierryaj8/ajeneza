import { NewsletterForm } from "@/components/forms/NewsletterForm";

/** Gold newsletter band shown above the footer on every public page. */
export function NewsletterBand() {
  return (
    <div className="bg-gold-600 py-10 text-cream">
      <div className="wrap flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
        <div>
          <h2 className="font-serif text-[28px] text-cream">A considered note, from time to time.</h2>
          <p className="text-xs text-gold-100">Occasional writing on technology, society, ideas and the things worth paying attention to.</p>
        </div>
        <NewsletterForm source="band" variant="band" />
      </div>
    </div>
  );
}

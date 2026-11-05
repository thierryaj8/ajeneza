export function IntroStrip({ quote }: { quote?: string }) {
  return (
    <div className="border-b border-[#d9d0c2] bg-sand dark:border-line dark:bg-surface-2">
      <div className="wrap flex flex-col items-start justify-between gap-3 py-6 md:flex-row md:items-center">
        <p className="font-serif text-lg italic text-[#34434a] dark:text-ink">&ldquo;{quote ?? "Exploring ideas. Building solutions. Telling stories. Creating impact."}&rdquo;</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] uppercase tracking-[0.13em] text-muted">
          <span>Journalism</span><span>Technology</span><span>Literature</span><span>Entrepreneurship</span>
        </div>
      </div>
    </div>
  );
}

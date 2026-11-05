import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">This page could not be found</h1>
      <p className="mt-4 max-w-md text-muted">It may have moved, or it may not be published yet.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary">Go home</Link>
        <Link href="/search" className="btn-secondary">Search the site</Link>
      </div>
    </main>
  );
}

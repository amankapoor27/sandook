import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function AboutSnippet() {
  const snippet = siteConfig.about.split("\n\n")[0];

  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <hr className="section-rule mb-12" />
      <div className="mx-auto max-w-lg text-center">
        <p className="section-label mb-4">The studio</p>
        <p className="font-display text-2xl leading-relaxed text-foreground md:text-[1.75rem] md:leading-relaxed">
          {snippet}
        </p>
        <Link
          href="/about"
          className="mt-8 inline-block text-xs font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
        >
          About the artist
        </Link>
      </div>
    </section>
  );
}

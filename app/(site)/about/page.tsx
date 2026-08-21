import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.artistName} — ${siteConfig.tagline}`,
};

export default function AboutPage() {
  const paragraphs = siteConfig.about.split("\n\n");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-medium text-foreground">
        About
      </h1>
      <div className="prose-site mt-8 space-y-4 text-base leading-relaxed text-muted">
        {paragraphs.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/gallery"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          View gallery
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:border-accent hover:text-accent"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}

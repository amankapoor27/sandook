import Link from "next/link";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import type { GalleryImageView } from "@/lib/gallery";

type FeaturedWorkProps = {
  images: GalleryImageView[];
  excludeSlug?: string;
};

export function FeaturedWork({ images, excludeSlug }: FeaturedWorkProps) {
  const filtered = images
    .filter((img) => img.slug !== excludeSlug)
    .slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 pb-20">
      <hr className="section-rule mb-12" />
      <div className="mb-10 flex items-end justify-between gap-6">
        <div>
          <p className="section-label mb-3">Gallery</p>
          <h2 className="font-display text-3xl font-normal text-foreground md:text-4xl">
            Selected pieces
          </h2>
        </div>
        <Link
          href="/gallery"
          className="shrink-0 text-xs font-medium uppercase tracking-[0.14em] text-muted transition-colors hover:text-accent"
        >
          View all
        </Link>
      </div>
      <GalleryGrid images={filtered} variant="gallery" columns={3} />
    </section>
  );
}

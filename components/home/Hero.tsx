import Image from "next/image";
import Link from "next/link";
import type { GalleryImageView } from "@/lib/gallery";
import { artworkHref } from "@/lib/gallery-nav";
import { formatPrice, siteConfig } from "@/lib/site";

type HeroProps = {
  featured: GalleryImageView | null;
};

export function Hero({ featured }: HeroProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 pt-14 md:pb-28 md:pt-20">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-end lg:gap-16">
        <div className="max-w-md space-y-8 lg:pb-4">
          <p className="section-label">Original art & handmade work</p>
          <h1 className="font-display text-[2.75rem] font-normal leading-[1.08] text-foreground sm:text-5xl md:text-[3.25rem]">
            {siteConfig.tagline}
          </h1>
          <p className="text-[0.9375rem] leading-[1.75] text-muted">
            Paintings from the studio, plus fine art prints in multiple sizes.
          </p>
          <div className="flex items-center gap-6 pt-2">
            <Link
              href="/gallery"
              className="text-sm font-medium uppercase tracking-[0.14em] text-foreground underline decoration-line decoration-1 underline-offset-[6px] transition-colors hover:text-accent hover:decoration-accent"
            >
              View gallery
            </Link>
            <Link
              href="/commissions"
              className="text-sm text-muted transition-colors hover:text-accent"
            >
              Commissions
            </Link>
          </div>
        </div>

        {featured ? (
          <figure className="space-y-4">
            <Link
              href={artworkHref(featured.slug, featured.category)}
              className="group relative block aspect-[4/3] overflow-hidden bg-line sm:aspect-[3/2]"
            >
              <Image
                src={featured.fullUrl}
                alt={featured.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover transition-opacity duration-700 group-hover:opacity-95"
              />
            </Link>
            <figcaption className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="font-display text-xl text-foreground">
                  {featured.title}
                </p>
                {featured.medium && (
                  <p className="mt-1 text-sm text-muted">{featured.medium}</p>
                )}
              </div>
              {formatPrice(featured.price, featured.priceOnRequest) && (
                <p className="shrink-0 text-sm text-muted">
                  {formatPrice(featured.price, featured.priceOnRequest)}
                </p>
              )}
            </figcaption>
          </figure>
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center border border-dashed border-line bg-surface">
            <p className="text-sm text-muted">New work coming soon</p>
          </div>
        )}
      </div>
    </section>
  );
}

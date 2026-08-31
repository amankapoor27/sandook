import Link from "next/link";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { ImageCarousel } from "@/components/gallery/ImageCarousel";
import { ArtworkDetailShell } from "@/components/work/ArtworkDetailShell";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import type { GalleryImageView } from "@/lib/gallery";
import {
  artworkHref,
  galleryHref,
  type GalleryCategoryFilter,
} from "@/lib/gallery-nav";
import { usesPrintFieldSet } from "@/lib/category-utils";
import { resolvePrintSizes, resolvePrintSurfaces } from "@/lib/prints";
import { formatPrice, siteConfig, statusLabel } from "@/lib/site";
import type { VocabularyCategory } from "@/lib/types";
import {
  isWhatsAppConfigured,
  whatsAppArtworkUrl,
} from "@/lib/whatsapp";

type ArtworkDetailProps = {
  artwork: GalleryImageView;
  prev: GalleryImageView | null;
  next: GalleryImageView | null;
  galleryCategory?: GalleryCategoryFilter;
  categories?: VocabularyCategory[];
};

export function ArtworkDetail({
  artwork,
  prev,
  next,
  galleryCategory = "all",
  categories = [],
}: ArtworkDetailProps) {
  const isPrint = usesPrintFieldSet(artwork.category, categories);
  const isPainting = !isPrint;
  const priceDisplay = isPainting
    ? formatPrice(artwork.price, artwork.priceOnRequest)
    : "";
  const printSizes = resolvePrintSizes(artwork);
  const printSurfaces = resolvePrintSurfaces(artwork);

  return (
    <ArtworkDetailShell galleryCategory={galleryCategory}>
      <article className="rounded-2xl border border-border bg-surface px-6 py-12 shadow-lg md:px-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <ImageCarousel photos={artwork.photos} title={artwork.title} />

          <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="section-label">
              {isPrint
                ? "Art print"
                : (artwork.collection ?? "Original painting")}
            </p>
            <h1 className="font-display mt-2 text-4xl font-medium text-foreground">
              {artwork.title}
            </h1>
            {artwork.caption && artwork.caption !== artwork.title && (
              <p className="mt-2 text-muted">{artwork.caption}</p>
            )}
          </div>

          <dl className="grid gap-3 text-sm text-foreground">
            {artwork.medium && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-foreground/70">
                  Medium
                </dt>
                <dd className="text-foreground">{artwork.medium}</dd>
              </div>
            )}
            {artwork.dimensions && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-foreground/70">
                  Dimensions
                </dt>
                <dd className="text-foreground">{artwork.dimensions}</dd>
              </div>
            )}
            {artwork.year && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-foreground/70">
                  Year
                </dt>
                <dd className="text-foreground">{artwork.year}</dd>
              </div>
            )}
            {isPainting && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-foreground/70">
                  Status
                </dt>
                <dd className="text-foreground">
                  {statusLabel(artwork.status)}
                </dd>
              </div>
            )}
            {priceDisplay && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 font-medium text-foreground/70">
                  Price
                </dt>
                <dd className="font-medium text-foreground">{priceDisplay}</dd>
              </div>
            )}
            {isPrint && (
              <>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-medium text-foreground/70">
                    Sizes
                  </dt>
                  <dd className="flex flex-wrap gap-1.5 text-foreground">
                    {printSizes.map((size) => (
                      <span
                        key={size}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground"
                      >
                        {size}
                      </span>
                    ))}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-24 shrink-0 font-medium text-foreground/70">
                    Surfaces
                  </dt>
                  <dd className="flex flex-wrap gap-1.5 text-foreground">
                    {printSurfaces.map((surface) => (
                      <span
                        key={surface}
                        className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground"
                      >
                        {surface}
                      </span>
                    ))}
                  </dd>
                </div>
              </>
            )}
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            {isPainting &&
              (artwork.status === "available" ||
                artwork.status === "not_for_sale") && (
              <>
                <TrackedLink
                  href={`/contact?type=purchase&slug=${encodeURIComponent(artwork.slug)}&title=${encodeURIComponent(artwork.title)}`}
                  analyticsEvent="inquire_click"
                  analyticsSlug={artwork.slug}
                  className="btn btn-pill bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                  Inquire via form
                </TrackedLink>
                {artwork.status === "available" && isWhatsAppConfigured() && (
                  <WhatsAppButton
                    href={whatsAppArtworkUrl(
                      artwork.title,
                      artwork.slug,
                      artwork.price,
                      artwork.priceOnRequest,
                    )}
                    label="Chat on WhatsApp"
                    trackSlug={artwork.slug}
                  />
                )}
              </>
            )}
            {isPrint && (
              <TrackedLink
                href={`/contact?type=purchase&slug=${encodeURIComponent(artwork.slug)}&title=${encodeURIComponent(artwork.title)}`}
                analyticsEvent="inquire_click"
                analyticsSlug={artwork.slug}
                className="btn btn-pill bg-accent px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
              >
                Order a print
              </TrackedLink>
            )}
            <Link
              href={galleryHref(galleryCategory)}
              className="btn btn-pill btn-secondary px-6 py-2.5 text-sm font-medium"
            >
              Back to gallery
            </Link>
          </div>
        </div>
      </div>

      <nav
        aria-label="Artwork navigation"
        className="mt-16 flex items-center justify-between border-t border-border pt-8"
      >
        {prev ? (
          <Link
            href={artworkHref(prev.slug, galleryCategory)}
            className="group text-sm text-muted hover:text-accent"
          >
            <span className="block text-xs uppercase tracking-widest">
              Previous
            </span>
            <span className="font-display text-lg text-foreground group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={artworkHref(next.slug, galleryCategory)}
            className="group text-right text-sm text-muted hover:text-accent"
          >
            <span className="block text-xs uppercase tracking-widest">Next</span>
            <span className="font-display text-lg text-foreground group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
      </article>
    </ArtworkDetailShell>
  );
}

export function artworkJsonLd(artwork: GalleryImageView) {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    creator: {
      "@type": "Person",
      name: siteConfig.artistName,
    },
    image: artwork.photos.map((p) => p.fullUrl),
    artMedium: artwork.medium,
    width: artwork.dimensions,
    dateCreated: artwork.year?.toString(),
    description: artwork.caption ?? artwork.title,
    offers:
      artwork.status === "available" && artwork.price
        ? {
            "@type": "Offer",
            price: artwork.price,
            priceCurrency: siteConfig.currency,
            availability: "https://schema.org/InStock",
          }
        : undefined,
  };
}

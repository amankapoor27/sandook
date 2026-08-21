import Link from "next/link";
import { ImageCarousel } from "@/components/gallery/ImageCarousel";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import type { GalleryImageView } from "@/lib/gallery";
import { formatPrice, siteConfig, statusLabel } from "@/lib/site";
import {
  isWhatsAppConfigured,
  whatsAppArtworkUrl,
} from "@/lib/whatsapp";

type ArtworkDetailProps = {
  artwork: GalleryImageView;
  prev: GalleryImageView | null;
  next: GalleryImageView | null;
};

export function ArtworkDetail({ artwork, prev, next }: ArtworkDetailProps) {
  const isPainting = artwork.category === "painting";
  const priceDisplay = isPainting
    ? formatPrice(artwork.price, artwork.priceOnRequest)
    : "";

  return (
    <article className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ImageCarousel photos={artwork.photos} title={artwork.title} />

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <p className="section-label">
              {artwork.category === "diy"
                ? "DIY project"
                : (artwork.collection ?? "Original painting")}
            </p>
            <h1 className="font-display mt-2 text-4xl font-medium text-foreground">
              {artwork.title}
            </h1>
            {artwork.caption && artwork.caption !== artwork.title && (
              <p className="mt-2 text-muted">{artwork.caption}</p>
            )}
          </div>

          <dl className="grid gap-3 text-sm">
            {artwork.medium && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Medium</dt>
                <dd>{artwork.medium}</dd>
              </div>
            )}
            {artwork.dimensions && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Dimensions</dt>
                <dd>{artwork.dimensions}</dd>
              </div>
            )}
            {artwork.year && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Year</dt>
                <dd>{artwork.year}</dd>
              </div>
            )}
            {isPainting && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Status</dt>
                <dd>{statusLabel(artwork.status)}</dd>
              </div>
            )}
            {priceDisplay && (
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted">Price</dt>
                <dd className="font-medium">{priceDisplay}</dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            {isPainting &&
              (artwork.status === "available" ||
                artwork.status === "not_for_sale") && (
              <>
                <Link
                  href={`/contact?type=purchase&slug=${encodeURIComponent(artwork.slug)}&title=${encodeURIComponent(artwork.title)}`}
                  className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Inquire via form
                </Link>
                {artwork.status === "available" && isWhatsAppConfigured() && (
                  <WhatsAppButton
                    href={whatsAppArtworkUrl(
                      artwork.title,
                      artwork.slug,
                      artwork.price,
                      artwork.priceOnRequest,
                    )}
                    label="Chat on WhatsApp"
                  />
                )}
              </>
            )}
            <Link
              href="/gallery"
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
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
            href={`/gallery/${prev.slug}`}
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
            href={`/gallery/${next.slug}`}
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

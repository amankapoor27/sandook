"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { GalleryImageView } from "@/lib/gallery";
import { artworkHref, type GalleryCategoryFilter } from "@/lib/gallery-nav";
import { usesPrintFieldSet, resolveCategoryLabel } from "@/lib/category-utils";
import { formatPrice } from "@/lib/site";
import type { VocabularyCategory } from "@/lib/types";
import { Lightbox } from "./Lightbox";

type GalleryGridProps = {
  images: GalleryImageView[];
  variant: "work" | "print" | "gallery";
  onSelect?: (image: GalleryImageView) => void;
  galleryCategory?: GalleryCategoryFilter;
  columns?: 3 | 4;
  categories?: VocabularyCategory[];
};

export function GalleryGrid({
  images,
  variant,
  onSelect,
  galleryCategory = "all",
  columns = 4,
  categories = [],
}: GalleryGridProps) {
  const [lightboxImage, setLightboxImage] = useState<GalleryImageView | null>(
    null,
  );

  const gridClass =
    columns === 3
      ? "grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
      : "grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4";

  if (images.length === 0) {
    return (
      <div className="border border-dashed border-line px-6 py-16 text-center">
        <p className="font-display text-xl text-foreground">No images yet</p>
        <p className="mt-2 text-sm text-muted">
          {variant === "work"
            ? "Paintings will appear here once uploaded."
            : "Prints will appear here once uploaded."}
        </p>
      </div>
    );
  }

  function handleClick(image: GalleryImageView) {
    if (variant === "print") {
      if (onSelect) onSelect(image);
      else setLightboxImage(image);
    }
  }

  function isDetailLink() {
    return variant === "work" || variant === "gallery";
  }

  function detailHref(image: GalleryImageView) {
    return artworkHref(image.slug, galleryCategory);
  }

  function renderCaption(image: GalleryImageView) {
    if (variant === "print") {
      return (
        <figcaption className="mt-3">
          <p className="font-display text-lg text-foreground">{image.title}</p>
        </figcaption>
      );
    }

    const price = formatPrice(image.price, image.priceOnRequest);
    const isPrint = usesPrintFieldSet(image.category, categories);
    const categoryName = resolveCategoryLabel(image.category, categories);

    return (
      <figcaption className="mt-3 flex items-baseline justify-between gap-2">
        <div>
          <p className="font-display text-lg text-foreground">{image.title}</p>
          {isPrint && (
            <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.14em] text-muted">
              {categoryName}
            </p>
          )}
        </div>
        {price && !isPrint && (
          <p
            className={`shrink-0 text-xs uppercase tracking-[0.1em] ${
              image.status === "sold" ? "text-muted line-through" : "text-muted"
            }`}
          >
            {price}
          </p>
        )}
      </figcaption>
    );
  }

  return (
    <>
      <div className={gridClass}>
        {images.map((image) => {
          const imageBlock = (
            <div className="relative aspect-[4/3] overflow-hidden bg-line sm:aspect-[3/2]">
              <Image
                src={image.fullUrl}
                alt={image.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-opacity duration-500 group-hover:opacity-90"
              />
              {variant !== "print" &&
                !usesPrintFieldSet(image.category, categories) &&
                image.status === "sold" && (
                <span className="absolute right-3 top-3 bg-background/90 px-2 py-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted">
                  Sold
                </span>
              )}
            </div>
          );

          if (isDetailLink()) {
            return (
              <figure key={image.id}>
                <Link href={detailHref(image)} className="group block">
                  {imageBlock}
                  {renderCaption(image)}
                </Link>
              </figure>
            );
          }

          return (
            <figure key={image.id}>
              <button
                type="button"
                onClick={() => handleClick(image)}
                className="group block w-full text-left"
              >
                {imageBlock}
                {renderCaption(image)}
              </button>
            </figure>
          );
        })}
      </div>

      {variant === "print" && !onSelect && (
        <Lightbox
          image={lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </>
  );
}

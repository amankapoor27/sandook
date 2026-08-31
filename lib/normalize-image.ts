import type { GalleryImage, ItemPhoto } from "./types";
import { normalizeCategory } from "./categories";

/** Backwards-compatible normalization for legacy manifest entries. */
export function normalizeImage(
  raw: Partial<GalleryImage> &
    Pick<GalleryImage, "id" | "category" | "thumbKey" | "fullKey" | "uploadedAt">,
): GalleryImage {
  const title = raw.title?.trim() || raw.caption?.trim() || "Untitled";

  let photos: ItemPhoto[] = raw.photos ?? [];
  if (photos.length === 0 && raw.thumbKey && raw.fullKey) {
    photos = [
      {
        id: "primary",
        thumbKey: raw.thumbKey,
        fullKey: raw.fullKey,
      },
    ];
  }

  const primary = photos[0];

  return {
    id: raw.id,
    slug: raw.slug?.trim() || raw.id,
    category: normalizeCategory(raw.category),
    caption: raw.caption,
    title,
    medium: raw.medium,
    dimensions: raw.dimensions,
    year: raw.year,
    price: raw.price,
    priceOnRequest: raw.priceOnRequest ?? false,
    status: raw.status ?? "available",
    featured: raw.featured ?? false,
    homepageHero: raw.homepageHero ?? false,
    collection: raw.collection,
    printSizes: raw.printSizes,
    printSurfaces: raw.printSurfaces,
    thumbKey: primary?.thumbKey ?? raw.thumbKey,
    fullKey: primary?.fullKey ?? raw.fullKey,
    photos,
    uploadedAt: raw.uploadedAt,
  };
}

export function syncPrimaryPhoto(image: GalleryImage): GalleryImage {
  const primary = image.photos[0];
  if (!primary) return image;
  return {
    ...image,
    thumbKey: primary.thumbKey,
    fullKey: primary.fullKey,
  };
}

import type { GalleryImageView } from "./gallery";

/** Admin list: newest uploads first (public gallery uses collection order). */
export function sortImagesForAdmin(
  images: GalleryImageView[],
): GalleryImageView[] {
  return [...images].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export function dedupeGalleryImages(
  images: GalleryImageView[],
): GalleryImageView[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (seen.has(image.id)) return false;
    seen.add(image.id);
    return true;
  });
}

/** Drop manifest rows that cannot render a thumbnail in admin. */
export function filterDisplayableAdminImages(
  images: GalleryImageView[],
): GalleryImageView[] {
  return images.filter(
    (image) => image.photos.length > 0 && Boolean(image.thumbUrl),
  );
}

export function normalizeAdminGalleryImages(
  images: GalleryImageView[],
): GalleryImageView[] {
  return sortImagesForAdmin(
    dedupeGalleryImages(filterDisplayableAdminImages(images)),
  );
}

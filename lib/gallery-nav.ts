import { normalizeCategory } from "./categories";

export type GalleryCategoryFilter = string | "all";

export function parseGalleryCategory(
  value: string | null | undefined,
): GalleryCategoryFilter {
  if (!value || value === "all") return "all";
  const slug = normalizeCategory(value);
  return slug || "all";
}

export function galleryHref(category: GalleryCategoryFilter = "all"): string {
  if (category === "all") return "/gallery";
  return `/gallery?category=${encodeURIComponent(category)}`;
}

export function artworkHref(
  slug: string,
  category: GalleryCategoryFilter = "all",
): string {
  if (category === "all") return `/gallery/${slug}`;
  return `/gallery/${slug}?category=${encodeURIComponent(category)}`;
}

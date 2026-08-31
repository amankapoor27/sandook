import type { ArtworkMetadata } from "./upload-meta";
import { parseArtworkMetadata, parseCategory, parseStringArray } from "./upload-meta";
import type { Category } from "./types";

export function metadataFromJson(
  body: Record<string, unknown>,
): ArtworkMetadata & { category?: Category } {
  const form = new FormData();
  const stringFields = [
    "title",
    "medium",
    "dimensions",
    "year",
    "price",
    "status",
    "collection",
    "slug",
    "caption",
    "category",
  ] as const;

  for (const key of stringFields) {
    const value = body[key];
    if (value !== undefined && value !== null && value !== "") {
      form.append(key, String(value));
    }
  }

  if (body.priceOnRequest === true || body.priceOnRequest === "true") {
    form.append("priceOnRequest", "true");
  }
  if (body.featured === true || body.featured === "true") {
    form.append("featured", "true");
  }
  if (body.homepageHero === true || body.homepageHero === "true") {
    form.append("homepageHero", "true");
  }

  if (Array.isArray(body.printSizes)) {
    for (const size of body.printSizes) {
      if (typeof size === "string" && size.trim()) {
        form.append("printSizes", size.trim());
      }
    }
  }

  if (Array.isArray(body.printSurfaces)) {
    for (const surface of body.printSurfaces) {
      if (typeof surface === "string" && surface.trim()) {
        form.append("printSurfaces", surface.trim());
      }
    }
  }

  const meta = parseArtworkMetadata(form);
  const category =
    body.category !== undefined
      ? parseCategory(String(body.category))
      : undefined;

  return {
    ...meta,
    category,
    printSizes: parseStringArray(body.printSizes) ?? meta.printSizes,
    printSurfaces: parseStringArray(body.printSurfaces) ?? meta.printSurfaces,
  };
}

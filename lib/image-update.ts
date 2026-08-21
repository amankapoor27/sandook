import type { ArtworkMetadata } from "./upload-meta";
import { parseArtworkMetadata, parseCategory } from "./upload-meta";

export function metadataFromJson(
  body: Record<string, unknown>,
): ArtworkMetadata & { category?: "painting" | "diy" } {
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

  const meta = parseArtworkMetadata(form);
  const category =
    body.category !== undefined
      ? parseCategory(String(body.category))
      : undefined;

  return { ...meta, category };
}

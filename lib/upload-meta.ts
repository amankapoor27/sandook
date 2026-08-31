import { parseCategory } from "./categories";
import type { ArtworkStatus } from "./types";

export { parseCategory };

export function parseCaption(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 200) : undefined;
}

export function parseTitle(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 200) : undefined;
}

export function parseMedium(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 100) : undefined;
}

export function parseDimensions(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 100) : undefined;
}

export function parseYear(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const year = parseInt(value, 10);
  if (Number.isNaN(year) || year < 1900 || year > 2100) return undefined;
  return year;
}

export function parsePrice(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const price = parseFloat(value.replace(/,/g, ""));
  if (Number.isNaN(price) || price < 0) return undefined;
  return Math.round(price);
}

export function parseBoolean(value: FormDataEntryValue | null): boolean {
  if (value === "true" || value === "on" || value === "1") return true;
  return false;
}

export function parseStatus(value: FormDataEntryValue | null): ArtworkStatus {
  if (value === "sold" || value === "not_for_sale") return value;
  return "available";
}

export function parseCollection(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 100) : undefined;
}

export function parseSlug(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : undefined;
}

export function parseStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

export function parseStringArrayFromForm(form: FormData, key: string): string[] {
  return form
    .getAll(key)
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export type ArtworkMetadata = {
  title?: string;
  medium?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  priceOnRequest: boolean;
  status: ArtworkStatus;
  featured: boolean;
  homepageHero: boolean;
  collection?: string;
  slug?: string;
  caption?: string;
  printSizes?: string[];
  printSurfaces?: string[];
};

export function parseArtworkMetadata(form: FormData): ArtworkMetadata {
  const printSizes = parseStringArrayFromForm(form, "printSizes");
  const printSurfaces = parseStringArrayFromForm(form, "printSurfaces");

  return {
    title: parseTitle(form.get("title")),
    medium: parseMedium(form.get("medium")),
    dimensions: parseDimensions(form.get("dimensions")),
    year: parseYear(form.get("year")),
    price: parsePrice(form.get("price")),
    priceOnRequest: parseBoolean(form.get("priceOnRequest")),
    status: parseStatus(form.get("status")),
    featured: parseBoolean(form.get("featured")),
    homepageHero: parseBoolean(form.get("homepageHero")),
    collection: parseCollection(form.get("collection")),
    slug: parseSlug(form.get("slug")),
    caption: parseCaption(form.get("caption")),
    printSizes: printSizes.length > 0 ? printSizes : undefined,
    printSurfaces: printSurfaces.length > 0 ? printSurfaces : undefined,
  };
}

import { slugify } from "./slug";
import type { Category } from "./types";

export function parseCategory(
  value: FormDataEntryValue | string | null | undefined,
): Category {
  const raw =
    typeof value === "string"
      ? value.trim().toLowerCase()
      : value != null
        ? String(value).trim().toLowerCase()
        : "";

  if (raw === "diy") return "print";
  if (raw === "print" || raw === "painting") return raw;
  if (!raw) return "print";
  return slugify(raw) || "print";
}

export function normalizeCategory(value: unknown): Category {
  if (typeof value !== "string" || !value.trim()) return "print";
  return parseCategory(value);
}

export function categoryLabel(category: Category, plural = false): string {
  if (category === "painting") {
    return plural ? "Paintings" : "Painting";
  }
  if (category === "print") {
    return plural ? "Prints" : "Print";
  }
  const label = category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  return plural ? `${label}s` : label;
}

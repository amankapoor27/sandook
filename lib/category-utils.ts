import type { VocabularyCategory } from "./types";
import { categoryLabel as fallbackCategoryLabel } from "./categories";

export function usesPrintFieldSet(
  category: string,
  categories: VocabularyCategory[],
): boolean {
  const entry = categories.find((item) => item.slug === category);
  if (entry) return entry.fieldSet === "print";
  return category === "print";
}

export function getActiveStringOptions(
  entries: { value: string; active: boolean }[],
): string[] {
  return entries.filter((entry) => entry.active).map((entry) => entry.value);
}

export function resolveCategoryLabel(
  category: string,
  categories: VocabularyCategory[],
  plural = false,
): string {
  const entry = categories.find((item) => item.slug === category);
  if (!entry) return fallbackCategoryLabel(category, plural);
  if (plural && entry.label.endsWith("s")) return entry.label;
  if (plural && !entry.label.endsWith("s")) return `${entry.label}s`;
  return entry.label;
}

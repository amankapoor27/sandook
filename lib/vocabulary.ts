import "server-only";

import fs from "fs/promises";
import path from "path";
import { categoryLabel as legacyCategoryLabel, normalizeCategory } from "./categories";
import { resolveCategoryLabel } from "./category-utils";
import { getManifest } from "./manifest";
import { slugify } from "./slug";
import { getObject, putObject } from "./storage";
import { isR2Configured } from "./env";
import type {
  CategoryFieldSet,
  GalleryImage,
  Vocabulary,
  VocabularyCategory,
  VocabularyStringEntry,
} from "./types";

const VOCABULARY_KEY = "vocabulary.json";
const LOCAL_VOCABULARY = path.join(process.cwd(), "storage", "vocabulary.json");

export const DEFAULT_VOCABULARY: Vocabulary = {
  categories: [
    {
      slug: "print",
      label: "Prints",
      fieldSet: "print",
      active: true,
    },
  ],
  mediums: [],
  dimensions: [],
  years: [],
  collections: [],
};

function normalizeStringEntry(value: string): VocabularyStringEntry {
  return { value: value.trim(), active: true };
}

function normalizeCategoryEntry(entry: VocabularyCategory): VocabularyCategory {
  const slug = normalizeCategory(entry.slug);
  return {
    slug,
    label: entry.label?.trim() || legacyCategoryLabel(slug, true),
    fieldSet: entry.fieldSet === "print" ? "print" : "painting",
    active: entry.active !== false,
  };
}

function normalizeVocabulary(raw: Vocabulary): Vocabulary {
  const categories = (raw.categories ?? []).map(normalizeCategoryEntry);
  const ensureSlug = (slug: string, defaults: VocabularyCategory) => {
    if (!categories.some((entry) => entry.slug === slug)) {
      categories.unshift(defaults);
    }
  };
  ensureSlug("print", DEFAULT_VOCABULARY.categories[0]);

  const dedupeStringsSorted = (entries: VocabularyStringEntry[]) => {
    const map = new Map<string, VocabularyStringEntry>();
    for (const entry of entries) {
      const value = entry.value.trim();
      if (!value) continue;
      const existing = map.get(value.toLowerCase());
      map.set(value.toLowerCase(), {
        value,
        active: existing?.active !== false && entry.active !== false,
      });
    }
    return [...map.values()].sort((a, b) => a.value.localeCompare(b.value));
  };

  const dedupeCollections = (entries: VocabularyStringEntry[]) => {
    const map = new Map<string, VocabularyStringEntry>();
    const order: string[] = [];
    for (const entry of entries) {
      const value = entry.value.trim();
      if (!value) continue;
      const key = value.toLowerCase();
      const existing = map.get(key);
      if (!existing) order.push(key);
      map.set(key, {
        value,
        active: existing?.active !== false && entry.active !== false,
      });
    }
    return order.map((key) => map.get(key)!);
  };

  return {
    categories,
    mediums: dedupeStringsSorted(raw.mediums ?? []),
    dimensions: dedupeStringsSorted(raw.dimensions ?? []),
    years: dedupeStringsSorted(raw.years ?? []),
    collections: dedupeCollections(raw.collections ?? []),
  };
}

async function readVocabularyFile(): Promise<Vocabulary | null> {
  const stored = await getObject(VOCABULARY_KEY);
  if (stored) {
    return normalizeVocabulary(JSON.parse(stored.toString("utf-8")) as Vocabulary);
  }

  if (!isR2Configured()) {
    try {
      const raw = await fs.readFile(LOCAL_VOCABULARY, "utf-8");
      return normalizeVocabulary(JSON.parse(raw) as Vocabulary);
    } catch {
      return null;
    }
  }

  return null;
}

async function writeVocabulary(vocabulary: Vocabulary): Promise<void> {
  const normalized = normalizeVocabulary(vocabulary);
  const body = Buffer.from(JSON.stringify(normalized, null, 2), "utf-8");
  await putObject(VOCABULARY_KEY, body, "application/json");

  if (!isR2Configured()) {
    await fs.mkdir(path.dirname(LOCAL_VOCABULARY), { recursive: true });
    await fs.writeFile(LOCAL_VOCABULARY, body);
  }
}

function upsertStringEntry(
  entries: VocabularyStringEntry[],
  value: string,
): VocabularyStringEntry[] {
  const trimmed = value.trim();
  if (!trimmed) return entries;

  const index = entries.findIndex(
    (entry) => entry.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (index === -1) {
    return [...entries, normalizeStringEntry(trimmed)].sort((a, b) =>
      a.value.localeCompare(b.value),
    );
  }

  const next = [...entries];
  next[index] = { ...next[index], value: trimmed, active: true };
  return next;
}

function upsertCollectionEntry(
  entries: VocabularyStringEntry[],
  value: string,
): VocabularyStringEntry[] {
  const trimmed = value.trim();
  if (!trimmed) return entries;

  const index = entries.findIndex(
    (entry) => entry.value.toLowerCase() === trimmed.toLowerCase(),
  );
  if (index === -1) {
    return [...entries, normalizeStringEntry(trimmed)];
  }

  const next = [...entries];
  next[index] = { ...next[index], value: trimmed, active: true };
  return next;
}

function reorderCollectionEntry(
  entries: VocabularyStringEntry[],
  value: string,
  direction: "up" | "down",
): VocabularyStringEntry[] {
  const index = entries.findIndex(
    (entry) => entry.value.toLowerCase() === value.trim().toLowerCase(),
  );
  if (index === -1) return entries;

  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= entries.length) return entries;

  const next = [...entries];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function upsertCategory(
  categories: VocabularyCategory[],
  slug: string,
  label?: string,
  fieldSet: CategoryFieldSet = "painting",
): VocabularyCategory[] {
  const normalizedSlug = normalizeCategory(slug);
  const index = categories.findIndex((entry) => entry.slug === normalizedSlug);
  if (index === -1) {
    return [
      ...categories,
      {
        slug: normalizedSlug,
        label: label?.trim() || legacyCategoryLabel(normalizedSlug, true),
        fieldSet:
          normalizedSlug === "print" ? "print" : fieldSet,
        active: true,
      },
    ];
  }

  const next = [...categories];
  next[index] = {
    ...next[index],
    label: label?.trim() || next[index].label,
    active: true,
  };
  return next;
}

export async function getVocabulary(): Promise<Vocabulary> {
  const stored = await readVocabularyFile();
  return stored ?? normalizeVocabulary(DEFAULT_VOCABULARY);
}

export async function putVocabulary(vocabulary: Vocabulary): Promise<Vocabulary> {
  const normalized = normalizeVocabulary(vocabulary);
  await writeVocabulary(normalized);
  return normalized;
}

export type ArtworkVocabularyInput = {
  category: string;
  categoryLabel?: string;
  categoryFieldSet?: CategoryFieldSet;
  medium?: string;
  dimensions?: string;
  year?: number;
  collection?: string;
};

export async function registerArtworkVocabulary(
  input: ArtworkVocabularyInput,
): Promise<Vocabulary> {
  const vocabulary = await getVocabulary();
  let next: Vocabulary = {
    ...vocabulary,
    categories: upsertCategory(
      vocabulary.categories,
      input.category,
      input.categoryLabel,
      input.categoryFieldSet ?? "painting",
    ),
  };

  if (input.medium?.trim()) {
    next = {
      ...next,
      mediums: upsertStringEntry(next.mediums, input.medium),
    };
  }

  if (input.dimensions?.trim()) {
    next = {
      ...next,
      dimensions: upsertStringEntry(next.dimensions, input.dimensions),
    };
  }

  if (input.year) {
    next = {
      ...next,
      years: upsertStringEntry(next.years, String(input.year)),
    };
  }

  if (input.collection?.trim()) {
    next = {
      ...next,
      collections: upsertCollectionEntry(next.collections, input.collection),
    };
  }

  await writeVocabulary(next);
  return next;
}

export async function syncVocabularyFromManifest(): Promise<Vocabulary> {
  const manifest = await getManifest();
  let vocabulary = await getVocabulary();

  for (const image of manifest.images) {
    vocabulary = {
      ...vocabulary,
      categories: upsertCategory(vocabulary.categories, image.category),
    };

    if (image.medium?.trim()) {
      vocabulary = {
        ...vocabulary,
        mediums: upsertStringEntry(vocabulary.mediums, image.medium),
      };
    }

    if (image.dimensions?.trim()) {
      vocabulary = {
        ...vocabulary,
        dimensions: upsertStringEntry(vocabulary.dimensions, image.dimensions),
      };
    }

    if (image.year) {
      vocabulary = {
        ...vocabulary,
        years: upsertStringEntry(vocabulary.years, String(image.year)),
      };
    }

    if (image.collection?.trim()) {
      vocabulary = {
        ...vocabulary,
        collections: upsertCollectionEntry(vocabulary.collections, image.collection),
      };
    }
  }

  await writeVocabulary(vocabulary);
  return vocabulary;
}

export type GalleryCategoryTab = {
  slug: string;
  label: string;
  count: number;
};

export function buildGalleryCategoryTabs(
  images: GalleryImage[],
  vocabulary: Vocabulary,
): GalleryCategoryTab[] {
  const counts = new Map<string, number>();
  for (const image of images) {
    const slug = normalizeCategory(image.category);
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  const tabs: GalleryCategoryTab[] = [];
  const seen = new Set<string>();

  for (const entry of vocabulary.categories) {
    const count = counts.get(entry.slug) ?? 0;
    if (count === 0) continue;
    tabs.push({
      slug: entry.slug,
      label: resolveCategoryLabel(entry.slug, vocabulary.categories, true),
      count,
    });
    seen.add(entry.slug);
  }

  for (const [slug, count] of counts) {
    if (seen.has(slug) || count === 0) continue;
    tabs.push({
      slug,
      label: resolveCategoryLabel(slug, vocabulary.categories, true),
      count,
    });
  }

  return tabs;
}

export function slugFromCategoryLabel(label: string): string {
  return slugify(label) || "category";
}

export type VocabularyListKey =
  | "mediums"
  | "dimensions"
  | "years"
  | "collections";

export async function setVocabularyEntryActive(
  list: VocabularyListKey,
  value: string,
  active: boolean,
): Promise<Vocabulary> {
  const vocabulary = await getVocabulary();
  const entries = vocabulary[list].map((entry) =>
    entry.value.toLowerCase() === value.trim().toLowerCase()
      ? { ...entry, active }
      : entry,
  );
  return putVocabulary({ ...vocabulary, [list]: entries });
}

export async function addVocabularyStringEntry(
  list: VocabularyListKey,
  value: string,
): Promise<Vocabulary> {
  const vocabulary = await getVocabulary();
  const upsert =
    list === "collections" ? upsertCollectionEntry : upsertStringEntry;
  return putVocabulary({
    ...vocabulary,
    [list]: upsert(vocabulary[list], value),
  });
}

export async function reorderVocabularyCollection(
  value: string,
  direction: "up" | "down",
): Promise<Vocabulary> {
  const vocabulary = await getVocabulary();
  return putVocabulary({
    ...vocabulary,
    collections: reorderCollectionEntry(vocabulary.collections, value, direction),
  });
}

export async function setCategoryActive(
  slug: string,
  active: boolean,
): Promise<Vocabulary> {
  const vocabulary = await getVocabulary();
  const normalized = normalizeCategory(slug);
  const categories = vocabulary.categories.map((entry) =>
    entry.slug === normalized ? { ...entry, active } : entry,
  );
  return putVocabulary({ ...vocabulary, categories });
}

export async function addVocabularyCategory(
  label: string,
  fieldSet: CategoryFieldSet = "painting",
): Promise<Vocabulary> {
  const vocabulary = await getVocabulary();
  const slug = slugFromCategoryLabel(label);
  return putVocabulary({
    ...vocabulary,
    categories: upsertCategory(vocabulary.categories, slug, label, fieldSet),
  });
}

export function vocabularyForClient(vocabulary: Vocabulary) {
  return {
    categories: vocabulary.categories,
    mediums: vocabulary.mediums,
    dimensions: vocabulary.dimensions,
    years: vocabulary.years,
    collections: vocabulary.collections,
  };
}

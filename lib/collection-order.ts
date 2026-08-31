import type { GalleryImage, Vocabulary } from "./types";

type CollectionSortMeta = {
  tier: number;
  order: number;
  alpha: string;
  uploadedAt: number;
};

function collectionSortMeta(
  image: Pick<GalleryImage, "collection" | "uploadedAt">,
  vocabulary: Vocabulary,
): CollectionSortMeta {
  const name = image.collection?.trim() ?? "";
  const uploadedAt = new Date(image.uploadedAt).getTime();

  if (!name) {
    return { tier: 2, order: 0, alpha: "", uploadedAt };
  }

  const order = vocabulary.collections.findIndex(
    (entry) => entry.value.toLowerCase() === name.toLowerCase(),
  );
  if (order >= 0) {
    return { tier: 0, order, alpha: "", uploadedAt };
  }

  return { tier: 1, order: 0, alpha: name.toLowerCase(), uploadedAt };
}

function compareCollectionMeta(a: CollectionSortMeta, b: CollectionSortMeta): number {
  if (a.tier !== b.tier) return a.tier - b.tier;
  if (a.order !== b.order) return a.order - b.order;
  if (a.alpha !== b.alpha) return a.alpha.localeCompare(b.alpha);
  return b.uploadedAt - a.uploadedAt;
}

export function sortImagesByCollection<T extends Pick<GalleryImage, "collection" | "uploadedAt">>(
  images: T[],
  vocabulary: Vocabulary,
): T[] {
  return [...images].sort((a, b) =>
    compareCollectionMeta(collectionSortMeta(a, vocabulary), collectionSortMeta(b, vocabulary)),
  );
}

export function orderedCollectionNames(
  vocabulary: Vocabulary,
  inUse: Iterable<string>,
): string[] {
  const inUseMap = new Map<string, string>();
  for (const name of inUse) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    inUseMap.set(trimmed.toLowerCase(), trimmed);
  }

  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const entry of vocabulary.collections) {
    const key = entry.value.toLowerCase();
    const manifestName = inUseMap.get(key);
    if (!manifestName) continue;
    ordered.push(manifestName);
    seen.add(key);
  }

  const unknown = [...inUseMap.entries()]
    .filter(([key]) => !seen.has(key))
    .map(([, value]) => value)
    .sort((a, b) => a.localeCompare(b));

  return [...ordered, ...unknown];
}

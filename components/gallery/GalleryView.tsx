"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { GalleryGrid } from "./GalleryGrid";
import type { GalleryImageView } from "@/lib/gallery";
import { parseGalleryCategory } from "@/lib/gallery-nav";
import { usesPrintFieldSet } from "@/lib/category-utils";
import type { ArtworkStatus, VocabularyCategory } from "@/lib/types";
import { ARTWORK_STATUSES } from "@/lib/types";
import type { GalleryCategoryTab } from "@/lib/vocabulary";

type GalleryViewProps = {
  images: GalleryImageView[];
  collections: string[];
  categoryTabs: GalleryCategoryTab[];
  categories: VocabularyCategory[];
};

export function GalleryView({
  images,
  collections,
  categoryTabs,
  categories,
}: GalleryViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categoryFilter = parseGalleryCategory(searchParams.get("category"));
  const statusParam = searchParams.get("status");
  const statusFilter: ArtworkStatus | "all" =
    statusParam === "available" || statusParam === "sold"
      ? statusParam
      : "all";
  const collectionFilter = searchParams.get("collection") ?? "all";

  const showStatusFilter =
    categoryFilter === "all"
      ? images.some(
          (image) => !usesPrintFieldSet(image.category, categories),
        )
      : !usesPrintFieldSet(categoryFilter, categories);

  const filtered = useMemo(() => {
    return images.filter((image) => {
      if (categoryFilter !== "all" && image.category !== categoryFilter) {
        return false;
      }
      if (
        showStatusFilter &&
        statusFilter !== "all" &&
        !usesPrintFieldSet(image.category, categories) &&
        image.status !== statusFilter
      ) {
        return false;
      }
      if (
        collectionFilter !== "all" &&
        image.collection !== collectionFilter
      ) {
        return false;
      }
      return true;
    });
  }, [
    images,
    categoryFilter,
    statusFilter,
    collectionFilter,
    showStatusFilter,
    categories,
  ]);

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  function setCategoryFilter(value: string) {
    replaceParams((params) => {
      if (value === "all") params.delete("category");
      else params.set("category", value);
    });
  }

  function setStatusFilter(value: ArtworkStatus | "all") {
    replaceParams((params) => {
      if (value === "all") params.delete("status");
      else params.set("status", value);
    });
  }

  function setCollectionFilter(value: string) {
    replaceParams((params) => {
      if (value === "all") params.delete("collection");
      else params.set("collection", value);
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`btn px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] ${
              categoryFilter === "all"
                ? "bg-foreground text-background"
                : "text-muted ring-1 ring-line hover:text-foreground"
            }`}
          >
            All
          </button>
          {categoryTabs.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              onClick={() => setCategoryFilter(slug)}
              className={`btn px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] ${
                categoryFilter === slug
                  ? "bg-foreground text-background"
                  : "text-muted ring-1 ring-line hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {showStatusFilter && (
          <div className="flex flex-wrap gap-2">
            {ARTWORK_STATUSES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1 text-xs uppercase tracking-[0.1em] transition-colors ${
                  statusFilter === value
                    ? "text-accent underline decoration-accent underline-offset-4"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {collections.length > 0 && showStatusFilter && (
          <label className="flex flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center">
            Collection
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="w-full border border-line bg-surface px-3 py-2.5 text-foreground sm:w-auto"
            >
              <option value="all">All collections</option>
              {collections.map((collection) => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <GalleryGrid
        images={filtered}
        variant="gallery"
        galleryCategory={categoryFilter}
        categories={categories}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { GalleryGrid } from "./GalleryGrid";
import type { GalleryImageView } from "@/lib/gallery";
import type { ArtworkStatus, Category } from "@/lib/types";
import { ARTWORK_STATUSES, CATEGORIES } from "@/lib/types";

type GalleryViewProps = {
  images: GalleryImageView[];
  collections: string[];
};

export function GalleryView({ images, collections }: GalleryViewProps) {
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ArtworkStatus | "all">(
    "all",
  );
  const [collectionFilter, setCollectionFilter] = useState<string>("all");

  const showStatusFilter =
    categoryFilter === "all" || categoryFilter === "painting";

  const filtered = useMemo(() => {
    return images.filter((image) => {
      if (categoryFilter !== "all" && image.category !== categoryFilter) {
        return false;
      }
      if (
        showStatusFilter &&
        statusFilter !== "all" &&
        image.category === "painting" &&
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
  }, [images, categoryFilter, statusFilter, collectionFilter, showStatusFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={`px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                categoryFilter === value
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
          <label className="flex items-center gap-2 text-sm text-muted">
            Collection
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="border border-line bg-surface px-3 py-1.5 text-foreground"
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

      <GalleryGrid images={filtered} variant="gallery" />
    </div>
  );
}

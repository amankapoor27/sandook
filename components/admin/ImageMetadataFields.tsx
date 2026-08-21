"use client";

import type { Category, ArtworkStatus } from "@/lib/types";

export type ImageMetadata = {
  title: string;
  medium: string;
  dimensions: string;
  year: string;
  price: string;
  priceOnRequest: boolean;
  status: ArtworkStatus;
  featured: boolean;
  collection: string;
  slug: string;
  caption: string;
};

export const emptyImageMetadata = (): ImageMetadata => ({
  title: "",
  medium: "",
  dimensions: "",
  year: "",
  price: "",
  priceOnRequest: false,
  status: "available",
  featured: false,
  collection: "",
  slug: "",
  caption: "",
});

type ImageMetadataFieldsProps = {
  category: Category;
  metadata: ImageMetadata;
  onCategoryChange?: (category: Category) => void;
  onChange: (metadata: ImageMetadata) => void;
  disabled?: boolean;
  showCategory?: boolean;
};

export function ImageMetadataFields({
  category,
  metadata,
  onCategoryChange,
  onChange,
  disabled,
  showCategory = true,
}: ImageMetadataFieldsProps) {
  function updateField<K extends keyof ImageMetadata>(
    key: K,
    value: ImageMetadata[K],
  ) {
    onChange({ ...metadata, [key]: value });
  }

  const isPainting = category === "painting";

  return (
    <div className="space-y-4">
      {showCategory && onCategoryChange && (
        <label className="block text-sm font-medium text-zinc-700">
          Category
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as Category)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
            disabled={disabled}
          >
            <option value="painting">Painting</option>
            <option value="diy">DIY</option>
          </select>
        </label>
      )}

      {isPainting ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700">
            Title
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Artwork title"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Slug
            <input
              type="text"
              value={metadata.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="url-friendly-name"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Medium
            <input
              type="text"
              value={metadata.medium}
              onChange={(e) => updateField("medium", e.target.value)}
              placeholder="Oil on canvas"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Dimensions
            <input
              type="text"
              value={metadata.dimensions}
              onChange={(e) => updateField("dimensions", e.target.value)}
              placeholder='24" × 36"'
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Year
            <input
              type="number"
              value={metadata.year}
              onChange={(e) => updateField("year", e.target.value)}
              placeholder="2026"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Collection
            <input
              type="text"
              value={metadata.collection}
              onChange={(e) => updateField("collection", e.target.value)}
              placeholder="Series name"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Price (INR)
            <input
              type="number"
              value={metadata.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="25000"
              disabled={disabled || metadata.priceOnRequest}
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Status
            <select
              value={metadata.status}
              onChange={(e) =>
                updateField("status", e.target.value as ArtworkStatus)
              }
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="not_for_sale">Not for sale</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={metadata.priceOnRequest}
              onChange={(e) => updateField("priceOnRequest", e.target.checked)}
              disabled={disabled}
            />
            Price on request
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-700 sm:col-span-2">
            <input
              type="checkbox"
              checked={metadata.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              disabled={disabled}
            />
            Featured on homepage
          </label>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-zinc-700">
            Title
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Project title"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-zinc-700">
            Slug
            <input
              type="text"
              value={metadata.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="url-friendly-name"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
              disabled={disabled}
            />
          </label>
        </div>
      )}

      <label className="block text-sm font-medium text-zinc-700">
        Caption (optional)
        <input
          type="text"
          value={metadata.caption}
          onChange={(e) => updateField("caption", e.target.value)}
          placeholder="Short description"
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
          disabled={disabled}
        />
      </label>
    </div>
  );
}

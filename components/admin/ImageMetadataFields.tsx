"use client";

import {
  getActiveStringOptions,
  usesPrintFieldSet,
} from "@/lib/category-utils";
import type { ArtworkStatus, Vocabulary } from "@/lib/types";
import { PRINT_SIZES, PRINT_SURFACES } from "@/lib/types";
import { CategorySelect, VocabularyCombobox } from "./VocabularyFields";

export type ImageMetadata = {
  title: string;
  medium: string;
  dimensions: string;
  year: string;
  price: string;
  priceOnRequest: boolean;
  status: ArtworkStatus;
  featured: boolean;
  homepageHero: boolean;
  collection: string;
  slug: string;
  caption: string;
  printSizes: string[];
  printSurfaces: string[];
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
  homepageHero: false,
  collection: "",
  slug: "",
  caption: "",
  printSizes: [],
  printSurfaces: [],
});

export type ClientVocabulary = Vocabulary;

type ImageMetadataFieldsProps = {
  category: string;
  metadata: ImageMetadata;
  vocabulary: ClientVocabulary;
  onCategoryChange?: (category: string, label?: string) => void;
  onChange: (metadata: ImageMetadata) => void;
  disabled?: boolean;
  showCategory?: boolean;
};

function toggleListItem(list: string[], item: string): string[] {
  return list.includes(item)
    ? list.filter((value) => value !== item)
    : [...list, item];
}

function PrintOptionGroup({
  title,
  options,
  selected,
  onChange,
  disabled,
}: {
  title: string;
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset className="space-y-2 sm:col-span-2">
      <legend className="text-sm font-medium text-foreground">{title}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onChange(toggleListItem(selected, option))}
              className={`btn text-xs ${
                active ? "btn-primary" : "btn-secondary"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ImageMetadataFields({
  category,
  metadata,
  vocabulary,
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

  const isPrint = usesPrintFieldSet(category, vocabulary.categories);
  const mediumOptions = getActiveStringOptions(vocabulary.mediums);
  const dimensionOptions = getActiveStringOptions(vocabulary.dimensions);
  const yearOptions = getActiveStringOptions(vocabulary.years);
  const collectionOptions = getActiveStringOptions(vocabulary.collections);

  return (
    <div className="space-y-4">
      {showCategory && onCategoryChange && (
        <CategorySelect
          value={category}
          categories={vocabulary.categories}
          onChange={onCategoryChange}
          disabled={disabled}
        />
      )}

      {isPrint ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Title
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Print title"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Slug
            <input
              type="text"
              value={metadata.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="url-friendly-name"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              disabled={disabled}
            />
          </label>
          <PrintOptionGroup
            title="Available sizes"
            options={PRINT_SIZES}
            selected={metadata.printSizes}
            onChange={(printSizes) => updateField("printSizes", printSizes)}
            disabled={disabled}
          />
          <PrintOptionGroup
            title="Print surfaces"
            options={PRINT_SURFACES}
            selected={metadata.printSurfaces}
            onChange={(printSurfaces) =>
              updateField("printSurfaces", printSurfaces)
            }
            disabled={disabled}
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground">
            Title
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Artwork title"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              disabled={disabled}
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Slug
            <input
              type="text"
              value={metadata.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              placeholder="url-friendly-name"
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              disabled={disabled}
            />
          </label>
          <VocabularyCombobox
            label="Medium"
            value={metadata.medium}
            options={mediumOptions}
            onChange={(medium) => updateField("medium", medium)}
            placeholder="Oil on canvas"
            disabled={disabled}
          />
          <VocabularyCombobox
            label="Dimensions"
            value={metadata.dimensions}
            options={dimensionOptions}
            onChange={(dimensions) => updateField("dimensions", dimensions)}
            placeholder='24" × 36"'
            disabled={disabled}
          />
          <VocabularyCombobox
            label="Year"
            value={metadata.year}
            options={yearOptions}
            onChange={(year) => updateField("year", year)}
            placeholder="2026"
            inputMode="numeric"
            disabled={disabled}
          />
          <VocabularyCombobox
            label="Collection"
            value={metadata.collection}
            options={collectionOptions}
            onChange={(collection) => updateField("collection", collection)}
            placeholder="Series name"
            disabled={disabled}
          />
          <label className="block text-sm font-medium text-foreground">
            Price (INR)
            <input
              type="number"
              value={metadata.price}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="25000"
              disabled={disabled || metadata.priceOnRequest}
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground disabled:opacity-50"
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Status
            <select
              value={metadata.status}
              onChange={(e) =>
                updateField("status", e.target.value as ArtworkStatus)
              }
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
              disabled={disabled}
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="not_for_sale">Not for sale</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={metadata.priceOnRequest}
              onChange={(e) => updateField("priceOnRequest", e.target.checked)}
              disabled={disabled}
            />
            Price on request
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
            <input
              type="checkbox"
              checked={metadata.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
              disabled={disabled}
            />
            Featured in homepage gallery row
          </label>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={metadata.homepageHero}
          onChange={(e) => updateField("homepageHero", e.target.checked)}
          disabled={disabled}
        />
        Homepage hero image — large image beside the intro text
      </label>

      <label className="block text-sm font-medium text-foreground">
        Caption (optional)
        <input
          type="text"
          value={metadata.caption}
          onChange={(e) => updateField("caption", e.target.value)}
          placeholder="Short description"
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground"
          disabled={disabled}
        />
      </label>
    </div>
  );
}

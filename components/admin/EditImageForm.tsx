"use client";

import { useState } from "react";
import type { GalleryImageView } from "@/lib/gallery";
import { usesPrintFieldSet } from "@/lib/category-utils";
import type { ImageMetadata, ClientVocabulary } from "./ImageMetadataFields";
import {
  emptyImageMetadata,
  ImageMetadataFields,
} from "./ImageMetadataFields";
import { ItemPhotosEditor } from "./ItemPhotosEditor";

function imageToMetadata(image: GalleryImageView): ImageMetadata {
  return {
    title: image.title,
    medium: image.medium ?? "",
    dimensions: image.dimensions ?? "",
    year: image.year?.toString() ?? "",
    price: image.price?.toString() ?? "",
    priceOnRequest: image.priceOnRequest ?? false,
    status: image.status,
    featured: image.featured ?? false,
    homepageHero: image.homepageHero ?? false,
    collection: image.collection ?? "",
    slug: image.slug,
    caption: image.caption ?? "",
    printSizes: image.printSizes ?? [],
    printSurfaces: image.printSurfaces ?? [],
  };
}

type EditImageFormProps = {
  image: GalleryImageView;
  vocabulary: ClientVocabulary;
  onSave: (
    id: string,
    category: string,
    metadata: ImageMetadata,
    categoryLabel?: string,
  ) => Promise<void>;
  onAddPhotos: (id: string, files: FileList) => Promise<void>;
  onRemovePhoto: (id: string, photoId: string) => Promise<void>;
  onCancel: () => void;
};

export function EditImageForm({
  image,
  vocabulary,
  onSave,
  onAddPhotos,
  onRemovePhoto,
  onCancel,
}: EditImageFormProps) {
  const [category, setCategory] = useState(image.category);
  const [categoryLabel, setCategoryLabel] = useState<string | undefined>();
  const [metadata, setMetadata] = useState<ImageMetadata>(() =>
    imageToMetadata(image),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCategoryChange(slug: string, label?: string) {
    setCategory(slug);
    setCategoryLabel(label);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (
      !usesPrintFieldSet(category, vocabulary.categories) &&
      !metadata.title.trim()
    ) {
      setError("Title is required for this category.");
      setSaving(false);
      return;
    }

    try {
      await onSave(image.id, category, metadata, categoryLabel);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 border-t border-border bg-surface px-4 py-4"
    >
      <p className="text-sm font-medium text-foreground">
        Edit details
        {image.title === "Untitled" && (
          <span className="ml-2 font-normal text-muted">
            — add a title and price
          </span>
        )}
      </p>
      <ItemPhotosEditor
        image={image}
        onAddPhotos={onAddPhotos}
        onRemovePhoto={onRemovePhoto}
        disabled={saving}
      />
      <ImageMetadataFields
        category={category}
        metadata={metadata}
        vocabulary={vocabulary}
        onCategoryChange={handleCategoryChange}
        onChange={setMetadata}
        disabled={saving}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="btn btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export { emptyImageMetadata, type ImageMetadata };

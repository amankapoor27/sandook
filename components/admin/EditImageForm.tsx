"use client";

import { useState } from "react";
import type { GalleryImageView } from "@/lib/gallery";
import type { ImageMetadata } from "./ImageMetadataFields";
import {
  emptyImageMetadata,
  ImageMetadataFields,
} from "./ImageMetadataFields";
import { ItemPhotosEditor } from "./ItemPhotosEditor";
import type { Category } from "@/lib/types";

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
    collection: image.collection ?? "",
    slug: image.slug,
    caption: image.caption ?? "",
  };
}

type EditImageFormProps = {
  image: GalleryImageView;
  onSave: (
    id: string,
    category: Category,
    metadata: ImageMetadata,
  ) => Promise<void>;
  onAddPhotos: (id: string, files: FileList) => Promise<void>;
  onRemovePhoto: (id: string, photoId: string) => Promise<void>;
  onCancel: () => void;
};

export function EditImageForm({
  image,
  onSave,
  onAddPhotos,
  onRemovePhoto,
  onCancel,
}: EditImageFormProps) {
  const [category, setCategory] = useState<Category>(image.category);
  const [metadata, setMetadata] = useState<ImageMetadata>(() =>
    imageToMetadata(image),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    if (category === "painting" && !metadata.title.trim()) {
      setError("Title is required for paintings.");
      setSaving(false);
      return;
    }

    try {
      await onSave(image.id, category, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="space-y-4 border-t border-zinc-100 bg-zinc-50 px-4 py-4"
    >
      <p className="text-sm font-medium text-zinc-900">
        Edit details
        {image.title === "Untitled" && (
          <span className="ml-2 font-normal text-zinc-500">
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
        onCategoryChange={setCategory}
        onChange={setMetadata}
        disabled={saving}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export { emptyImageMetadata, type ImageMetadata };

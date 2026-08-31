"use client";

import Image from "next/image";
import { useEffect } from "react";
import { EditImageForm } from "@/components/admin/EditImageForm";
import type {
  ClientVocabulary,
  ImageMetadata,
} from "@/components/admin/ImageMetadataFields";
import { resolveCategoryLabel, usesPrintFieldSet } from "@/lib/category-utils";
import type { GalleryImageView } from "@/lib/gallery";
import { formatPrice, statusLabel } from "@/lib/site";

type UploadListProps = {
  images: GalleryImageView[];
  vocabulary: ClientVocabulary;
  editingId: string | null;
  onEditingIdChange: (id: string | null) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    category: string,
    metadata: ImageMetadata,
    categoryLabel?: string,
  ) => Promise<void>;
  onAddPhotos: (id: string, files: FileList) => Promise<void>;
  onRemovePhoto: (id: string, photoId: string) => Promise<void>;
};

function needsDetails(
  image: GalleryImageView,
  vocabulary: ClientVocabulary,
): boolean {
  if (image.title === "Untitled") return true;
  if (!usesPrintFieldSet(image.category, vocabulary.categories)) {
    return !image.price && !image.priceOnRequest;
  }
  return !image.printSizes?.length || !image.printSurfaces?.length;
}

export function UploadList({
  images,
  vocabulary,
  editingId,
  onEditingIdChange,
  onDelete,
  onUpdate,
  onAddPhotos,
  onRemovePhoto,
}: UploadListProps) {
  useEffect(() => {
    if (editingId && !images.some((img) => img.id === editingId)) {
      onEditingIdChange(null);
    }
  }, [editingId, images, onEditingIdChange]);

  if (images.length === 0) {
    return (
      <p className="text-sm text-muted">
        No uploads yet. Drop your first image above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {images.map((image) => {
        const incomplete = needsDetails(image, vocabulary);
        const isEditing = editingId === image.id;
        const isPrint = usesPrintFieldSet(image.category, vocabulary.categories);

        return (
          <li key={image.id}>
            <div className="flex items-center gap-4 px-4 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={image.thumbUrl}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {image.title}
                  {incomplete && (
                    <span className="ml-2 text-xs font-normal text-amber-600">
                      needs details
                    </span>
                  )}
                  {image.homepageHero && (
                    <span className="ml-2 text-xs font-normal text-accent">
                      homepage hero
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {resolveCategoryLabel(image.category, vocabulary.categories)}
                  {image.photos.length > 1 && (
                    <> · {image.photos.length} photos</>
                  )}
                  {!isPrint && (
                    <>
                      {" · "}
                      {statusLabel(image.status)}
                      {formatPrice(image.price, image.priceOnRequest)
                        ? ` · ${formatPrice(image.price, image.priceOnRequest)}`
                        : ""}
                    </>
                  )}
                  {isPrint &&
                    image.printSizes?.length &&
                    image.printSurfaces?.length && (
                      <>
                        {" · "}
                        {image.printSizes.length} sizes ·{" "}
                        {image.printSurfaces.length} surfaces
                      </>
                    )}
                  {" · "}
                  {new Date(image.uploadedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onEditingIdChange(isEditing ? null : image.id)
                  }
                  className={`btn ${
                    isEditing
                      ? "btn-secondary"
                      : incomplete
                        ? "btn-primary"
                        : "btn-ghost"
                  }`}
                >
                  {isEditing ? "Close" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(image.id)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
            {isEditing && (
              <EditImageForm
                image={image}
                vocabulary={vocabulary}
                onSave={async (id, category, metadata, categoryLabel) => {
                  await onUpdate(id, category, metadata, categoryLabel);
                  onEditingIdChange(null);
                }}
                onAddPhotos={onAddPhotos}
                onRemovePhoto={onRemovePhoto}
                onCancel={() => onEditingIdChange(null)}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

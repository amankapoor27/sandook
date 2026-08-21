"use client";

import Image from "next/image";
import { useEffect } from "react";
import { EditImageForm } from "@/components/admin/EditImageForm";
import type { ImageMetadata } from "@/components/admin/ImageMetadataFields";
import type { GalleryImageView } from "@/lib/gallery";
import { formatPrice, statusLabel } from "@/lib/site";
import type { Category } from "@/lib/types";

type UploadListProps = {
  images: GalleryImageView[];
  editingId: string | null;
  onEditingIdChange: (id: string | null) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    category: Category,
    metadata: ImageMetadata,
  ) => Promise<void>;
  onAddPhotos: (id: string, files: FileList) => Promise<void>;
  onRemovePhoto: (id: string, photoId: string) => Promise<void>;
};

export function UploadList({
  images,
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
      <p className="text-sm text-zinc-500">
        No uploads yet. Drop your first image above.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200">
      {images.map((image) => {
        const needsDetails =
          image.title === "Untitled" ||
          (image.category === "painting" && !image.price && !image.priceOnRequest);

        return (
          <li key={image.id}>
            <div className="flex items-center gap-4 px-4 py-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={image.thumbUrl}
                  alt={image.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {image.title}
                  {needsDetails && (
                    <span className="ml-2 text-xs font-normal text-amber-700">
                      needs details
                    </span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">
                  <span className="capitalize">{image.category}</span>
                  {image.photos.length > 1 && (
                    <> · {image.photos.length} photos</>
                  )}
                  {image.category === "painting" && (
                    <>
                      {" · "}
                      {statusLabel(image.status)}
                      {formatPrice(image.price, image.priceOnRequest)
                        ? ` · ${formatPrice(image.price, image.priceOnRequest)}`
                        : ""}
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
                    onEditingIdChange(
                      editingId === image.id ? null : image.id,
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    needsDetails
                      ? "bg-zinc-900 text-white hover:bg-zinc-700"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {editingId === image.id ? "Close" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => void onDelete(image.id)}
                  className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
            {editingId === image.id && (
              <EditImageForm
                image={image}
                onSave={async (id, category, metadata) => {
                  await onUpdate(id, category, metadata);
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

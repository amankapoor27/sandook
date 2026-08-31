"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { GalleryImageView } from "@/lib/gallery";
import { MAX_PHOTOS_PER_ITEM } from "@/lib/types";

type ItemPhotosEditorProps = {
  image: GalleryImageView;
  onAddPhotos: (id: string, files: FileList) => Promise<void>;
  onRemovePhoto: (id: string, photoId: string) => Promise<void>;
  disabled?: boolean;
};

export function ItemPhotosEditor({
  image,
  onAddPhotos,
  onRemovePhoto,
  disabled = false,
}: ItemPhotosEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const atLimit = image.photos.length >= MAX_PHOTOS_PER_ITEM;

  async function handleFiles(files: FileList | null) {
    if (!files?.length || disabled || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onAddPhotos(image.id, files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(photoId: string) {
    if (disabled || busy) return;
    if (!confirm("Remove this photo?")) return;
    setBusy(true);
    setError(null);
    try {
      await onRemovePhoto(image.id, photoId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          Photos ({image.photos.length}/{MAX_PHOTOS_PER_ITEM})
        </p>
        {!atLimit && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              disabled={disabled || busy}
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={disabled || busy}
              onClick={() => inputRef.current?.click()}
              className="btn btn-secondary text-xs"
            >
              {busy ? "Uploading…" : "Add photos"}
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {image.photos.map((photo, index) => (
          <div
            key={photo.id}
            className="group relative h-20 w-20 overflow-hidden rounded border border-border bg-surface"
          >
            <Image
              src={photo.thumbUrl}
              alt={`Photo ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
            {index === 0 && (
              <span className="absolute left-0 top-0 bg-foreground px-1 text-[10px] text-background">
                Cover
              </span>
            )}
            {image.photos.length > 1 && (
              <button
                type="button"
                disabled={disabled || busy}
                onClick={() => void handleRemove(photo.id)}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0"
                aria-label={`Remove photo ${index + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!atLimit && image.photos.length === 1 && (
        <p className="text-xs text-muted">
          Add more photos so visitors can browse angles and details, like a
          product gallery.
        </p>
      )}
    </div>
  );
}

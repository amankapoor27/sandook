"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import {
  emptyImageMetadata,
  ImageMetadataFields,
  type ImageMetadata,
} from "./ImageMetadataFields";

export type UploadMetadata = ImageMetadata;

type DropZoneProps = {
  onUpload: (
    files: FileList,
    category: Category,
    metadata: UploadMetadata,
  ) => Promise<string[]>;
  disabled?: boolean;
};

export function DropZone({ onUpload, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState<Category>("painting");
  const [metadata, setMetadata] = useState<ImageMetadata>(emptyImageMetadata);
  const [showDetails, setShowDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || disabled || uploading) return;

    setUploading(true);
    setMessage(null);

    try {
      const uploadedIds = await onUpload(files, category, metadata);
      setMetadata(emptyImageMetadata());
      setShowDetails(false);
      setMessage(
        uploadedIds.length === 1
          ? "Uploaded — add title, price & details below."
          : `Uploaded ${uploadedIds.length} images — edit each one below.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-zinc-700">
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2"
          disabled={uploading}
        >
          <option value="painting">Painting</option>
          <option value="diy">DIY</option>
        </select>
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-zinc-900 bg-zinc-50" : "border-zinc-300"
        }`}
      >
        <p className="text-sm font-medium text-zinc-700">
          {uploading ? "Uploading…" : "Drag and drop images here"}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          JPEG, PNG, or WebP up to 15 MB — details can be added after upload
        </p>
        <label className="mt-4 inline-block cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700">
          Choose files
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            disabled={uploading || disabled}
            onChange={(event) => void handleFiles(event.target.files)}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails((open) => !open)}
        className="text-sm text-zinc-600 underline underline-offset-2 hover:text-zinc-900"
        disabled={uploading}
      >
        {showDetails
          ? "Hide optional fields"
          : "Set title, price & details before upload (optional)"}
      </button>

      {showDetails && (
        <ImageMetadataFields
          category={category}
          metadata={metadata}
          onCategoryChange={setCategory}
          onChange={setMetadata}
          disabled={uploading}
          showCategory={false}
        />
      )}

      {message && <p className="text-sm text-zinc-600">{message}</p>}
    </div>
  );
}

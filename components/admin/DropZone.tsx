"use client";

import { useState } from "react";
import { CategorySelect } from "@/components/admin/VocabularyFields";
import {
  emptyImageMetadata,
  ImageMetadataFields,
  type ClientVocabulary,
  type ImageMetadata,
} from "./ImageMetadataFields";

export type UploadMetadata = ImageMetadata;

type DropZoneProps = {
  onUpload: (
    files: FileList,
    category: string,
    metadata: UploadMetadata,
    categoryLabel?: string,
  ) => Promise<string[]>;
  vocabulary: ClientVocabulary;
  disabled?: boolean;
};

export function DropZone({ onUpload, vocabulary, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState("print");
  const [categoryLabel, setCategoryLabel] = useState<string | undefined>();
  const [metadata, setMetadata] = useState<ImageMetadata>(emptyImageMetadata);
  const [showDetails, setShowDetails] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleCategoryChange(slug: string, label?: string) {
    setCategory(slug);
    setCategoryLabel(label);
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0 || disabled || uploading) return;

    setUploading(true);
    setMessage(null);

    try {
      const uploadedIds = await onUpload(files, category, metadata, categoryLabel);
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
      <CategorySelect
        value={category}
        categories={vocabulary.categories}
        onChange={handleCategoryChange}
        disabled={uploading}
      />

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
          dragging ? "border-foreground bg-surface" : "border-border"
        }`}
      >
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Uploading…" : "Drag and drop images here"}
        </p>
        <p className="mt-1 text-xs text-muted">
          JPEG, PNG, or WebP up to 15 MB — 3:2 (~2400×1600) fills the grid best
        </p>
        <label className="btn btn-primary btn-pill mt-4 inline-flex cursor-pointer">
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
        className="btn btn-link text-sm"
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
          vocabulary={vocabulary}
          onCategoryChange={handleCategoryChange}
          onChange={setMetadata}
          disabled={uploading}
          showCategory={false}
        />
      )}

      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}

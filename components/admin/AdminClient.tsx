"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropZone, type UploadMetadata } from "@/components/admin/DropZone";
import type {
  ClientVocabulary,
  ImageMetadata,
} from "@/components/admin/ImageMetadataFields";
import { UploadList } from "@/components/admin/UploadList";
import type { GalleryImageView } from "@/lib/gallery";
import type { Vocabulary } from "@/lib/types";

type AdminClientProps = {
  initialImages: GalleryImageView[];
  initialVocabulary: Vocabulary;
};

function appendMetadata(
  form: FormData,
  metadata: UploadMetadata,
  categoryLabel?: string,
) {
  if (metadata.title) form.append("title", metadata.title);
  if (metadata.medium) form.append("medium", metadata.medium);
  if (metadata.dimensions) form.append("dimensions", metadata.dimensions);
  if (metadata.year) form.append("year", metadata.year);
  if (metadata.price) form.append("price", metadata.price);
  if (metadata.priceOnRequest) form.append("priceOnRequest", "true");
  form.append("status", metadata.status);
  if (metadata.featured) form.append("featured", "true");
  if (metadata.homepageHero) form.append("homepageHero", "true");
  if (metadata.collection) form.append("collection", metadata.collection);
  if (metadata.slug) form.append("slug", metadata.slug);
  if (metadata.caption) form.append("caption", metadata.caption);
  if (categoryLabel) form.append("categoryLabel", categoryLabel);
  for (const size of metadata.printSizes) {
    form.append("printSizes", size);
  }
  for (const surface of metadata.printSurfaces) {
    form.append("printSurfaces", surface);
  }
}

export function AdminClient({
  initialImages,
  initialVocabulary,
}: AdminClientProps) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [vocabulary, setVocabulary] = useState<ClientVocabulary>(initialVocabulary);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refreshVocabulary() {
    const response = await fetch("/api/vocabulary");
    if (!response.ok) return;
    const data = (await response.json()) as { vocabulary: Vocabulary };
    setVocabulary(data.vocabulary);
  }

  async function refreshImages() {
    const response = await fetch("/api/gallery");
    if (!response.ok) return;
    const data = (await response.json()) as { images: GalleryImageView[] };
    setImages(data.images);
  }

  async function handleUpload(
    files: FileList,
    category: string,
    metadata: UploadMetadata,
    categoryLabel?: string,
  ): Promise<string[]> {
    const form = new FormData();
    for (const file of Array.from(files)) {
      form.append("file", file);
    }
    form.append("category", category);
    appendMetadata(form, metadata, categoryLabel);

    const response = await fetch("/api/upload/complete", {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "Upload failed");
    }

    const data = (await response.json()) as { image: { id: string } };
    const uploadedIds = [data.image.id];

    await Promise.all([refreshImages(), refreshVocabulary()]);
    router.refresh();

    if (uploadedIds.length > 0) {
      setEditingId(uploadedIds[0]);
    }

    return uploadedIds;
  }

  async function handleUpdate(
    id: string,
    category: string,
    metadata: ImageMetadata,
    categoryLabel?: string,
  ) {
    const response = await fetch(`/api/upload/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        categoryLabel,
        title: metadata.title,
        slug: metadata.slug,
        medium: metadata.medium,
        dimensions: metadata.dimensions,
        year: metadata.year,
        price: metadata.price,
        priceOnRequest: metadata.priceOnRequest,
        status: metadata.status,
        featured: metadata.featured,
        homepageHero: metadata.homepageHero,
        collection: metadata.collection,
        caption: metadata.caption,
        printSizes: metadata.printSizes,
        printSurfaces: metadata.printSurfaces,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "Update failed");
    }

    await Promise.all([refreshImages(), refreshVocabulary()]);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const response = await fetch(`/api/upload/${id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Delete failed");
    }
    await refreshImages();
    router.refresh();
  }

  async function handleAddPhotos(id: string, files: FileList) {
    const form = new FormData();
    for (const file of Array.from(files)) {
      form.append("file", file);
    }

    const response = await fetch(`/api/upload/${id}/photos`, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "Upload failed");
    }

    await refreshImages();
    router.refresh();
  }

  async function handleRemovePhoto(id: string, photoId: string) {
    const response = await fetch(`/api/upload/${id}/photos/${photoId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "Remove failed");
    }

    await refreshImages();
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Manage gallery</h1>
        <p className="mt-1 text-sm text-muted">
          Upload first, then click Edit to set title, price, and other details.
        </p>
      </div>

      <DropZone onUpload={handleUpload} vocabulary={vocabulary} />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Uploaded images</h2>
        <UploadList
          images={images}
          vocabulary={vocabulary}
          editingId={editingId}
          onEditingIdChange={setEditingId}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onAddPhotos={handleAddPhotos}
          onRemovePhoto={handleRemovePhoto}
        />
      </section>
    </div>
  );
}

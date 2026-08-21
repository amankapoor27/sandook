"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DropZone, type UploadMetadata } from "@/components/admin/DropZone";
import type { ImageMetadata } from "@/components/admin/ImageMetadataFields";
import { UploadList } from "@/components/admin/UploadList";
import type { GalleryImageView } from "@/lib/gallery";
import type { Category } from "@/lib/types";

type AdminClientProps = {
  initialImages: GalleryImageView[];
};

function appendMetadata(form: FormData, metadata: UploadMetadata) {
  if (metadata.title) form.append("title", metadata.title);
  if (metadata.medium) form.append("medium", metadata.medium);
  if (metadata.dimensions) form.append("dimensions", metadata.dimensions);
  if (metadata.year) form.append("year", metadata.year);
  if (metadata.price) form.append("price", metadata.price);
  if (metadata.priceOnRequest) form.append("priceOnRequest", "true");
  form.append("status", metadata.status);
  if (metadata.featured) form.append("featured", "true");
  if (metadata.collection) form.append("collection", metadata.collection);
  if (metadata.slug) form.append("slug", metadata.slug);
  if (metadata.caption) form.append("caption", metadata.caption);
}

export function AdminClient({ initialImages }: AdminClientProps) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function refreshImages() {
    const response = await fetch("/api/gallery");
    if (!response.ok) return;
    const data = (await response.json()) as { images: GalleryImageView[] };
    setImages(data.images);
  }

  async function handleUpload(
    files: FileList,
    category: Category,
    metadata: UploadMetadata,
  ): Promise<string[]> {
    const form = new FormData();
    for (const file of Array.from(files)) {
      form.append("file", file);
    }
    form.append("category", category);
    appendMetadata(form, metadata);

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

    await refreshImages();
    router.refresh();

    if (uploadedIds.length > 0) {
      setEditingId(uploadedIds[0]);
    }

    return uploadedIds;
  }

  async function handleUpdate(
    id: string,
    category: Category,
    metadata: ImageMetadata,
  ) {
    const response = await fetch(`/api/upload/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        title: metadata.title,
        slug: metadata.slug,
        medium: metadata.medium,
        dimensions: metadata.dimensions,
        year: metadata.year,
        price: metadata.price,
        priceOnRequest: metadata.priceOnRequest,
        status: metadata.status,
        featured: metadata.featured,
        collection: metadata.collection,
        caption: metadata.caption,
      }),
    });

    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      throw new Error(data.error ?? "Update failed");
    }

    await refreshImages();
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

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Manage gallery</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Upload first, then click Edit to set title, price, and other details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
        >
          Log out
        </button>
      </div>

      <DropZone onUpload={handleUpload} />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Uploaded images</h2>
        <UploadList
          images={images}
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

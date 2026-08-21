import { NextResponse } from "next/server";
import { getExistingSlugs } from "@/lib/gallery";
import { metadataFromJson } from "@/lib/image-update";
import { getManifest, removeImageFromManifest, updateImageInManifest } from "@/lib/manifest";
import { slugify, uniqueSlug } from "@/lib/slug";
import { deleteObject } from "@/lib/storage";
import type { GalleryImage } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const manifest = await getManifest();
  const existing = manifest.images.find((img) => img.id === id);

  if (!existing) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const parsed = metadataFromJson(body);
  const category = parsed.category ?? existing.category;

  const titleFromBody =
    typeof body.title === "string" ? body.title.trim() : parsed.title?.trim();
  const finalTitle = titleFromBody || existing.title;

  const otherSlugs = (await getExistingSlugs()).filter((s) => s !== existing.slug);
  let slug = existing.slug;

  if (typeof body.slug === "string" && body.slug.trim()) {
    const candidate = slugify(body.slug.trim());
    if (!candidate) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    if (otherSlugs.includes(candidate) && candidate !== existing.slug) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
    slug = candidate;
  } else if (
    parsed.title &&
    parsed.title !== existing.title &&
    existing.slug === slugify(existing.title) &&
    !body.slug
  ) {
    slug = uniqueSlug(parsed.title, otherSlugs);
  }

  const updates: Partial<GalleryImage> = {
    category,
    title: finalTitle,
    slug,
    caption: parsed.caption ?? existing.caption,
  };

  if (category === "painting") {
    updates.medium = parsed.medium ?? existing.medium;
    updates.dimensions = parsed.dimensions ?? existing.dimensions;
    updates.year = parsed.year ?? existing.year;
    updates.price = parsed.priceOnRequest ? undefined : parsed.price ?? existing.price;
    updates.priceOnRequest = parsed.priceOnRequest;
    updates.status = parsed.status;
    updates.featured = parsed.featured;
    updates.collection = parsed.collection ?? existing.collection;
  } else {
    updates.medium = undefined;
    updates.dimensions = undefined;
    updates.year = undefined;
    updates.price = undefined;
    updates.priceOnRequest = false;
    updates.status = "not_for_sale";
    updates.featured = false;
    updates.collection = undefined;
  }

  if (category === "diy" && parsed.title) {
    updates.title = parsed.title;
    if (typeof body.slug === "string" && body.slug.trim()) {
      updates.slug = slug;
    } else if (
      parsed.title !== existing.title &&
      existing.slug === slugify(existing.title)
    ) {
      updates.slug = uniqueSlug(parsed.title, otherSlugs);
    }
  }

  await updateImageInManifest(id, updates);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const manifest = await getManifest();
  const image = manifest.images.find((img) => img.id === id);

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const keys = new Set<string>();
  for (const photo of image.photos) {
    keys.add(photo.thumbKey);
    keys.add(photo.fullKey);
  }
  for (const key of keys) {
    await deleteObject(key);
  }
  await removeImageFromManifest(id);

  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getExistingSlugs } from "@/lib/gallery";
import { parseCategory } from "@/lib/categories";
import { createImageId, validateUploadFile } from "@/lib/images";
import { storePhotoFiles } from "@/lib/item-photos";
import { addImageToManifest } from "@/lib/manifest";
import { syncPrimaryPhoto } from "@/lib/normalize-image";
import { uniqueSlug } from "@/lib/slug";
import {
  getObject,
  deleteObject,
  getPublicUrl,
  getStorageMode,
} from "@/lib/storage";
import type { ArtworkMetadata } from "@/lib/upload-meta";
import { parseArtworkMetadata } from "@/lib/upload-meta";
import { registerArtworkVocabulary } from "@/lib/vocabulary";
import type { Category, GalleryImage, ItemPhoto } from "@/lib/types";

type CompleteBody = {
  uploadId?: string;
  tempKey?: string;
  category?: Category;
  categoryLabel?: string;
  caption?: string;
  title?: string;
  medium?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  priceOnRequest?: boolean;
  status?: GalleryImage["status"];
  featured?: boolean;
  homepageHero?: boolean;
  collection?: string;
  slug?: string;
  printSizes?: string[];
  printSurfaces?: string[];
};

async function buildImageRecord(
  uploadId: string,
  category: Category,
  metadata: ArtworkMetadata,
  photos: ItemPhoto[],
): Promise<GalleryImage> {
  const existingSlugs = await getExistingSlugs();
  const title = metadata.title ?? metadata.caption ?? "Untitled";
  const slugBase = metadata.slug ?? title;
  const slug = uniqueSlug(slugBase, existingSlugs);
  const primary = photos[0];

  return syncPrimaryPhoto({
    id: uploadId,
    slug,
    category,
    caption: metadata.caption,
    title,
    medium: metadata.medium,
    dimensions: metadata.dimensions,
    year: metadata.year,
    price: metadata.priceOnRequest ? undefined : metadata.price,
    priceOnRequest: metadata.priceOnRequest,
    status: metadata.status,
    featured: metadata.featured,
    homepageHero: metadata.homepageHero,
    collection: metadata.collection,
    printSizes: metadata.printSizes,
    printSurfaces: metadata.printSurfaces,
    thumbKey: primary.thumbKey,
    fullKey: primary.fullKey,
    photos,
    uploadedAt: new Date().toISOString(),
  });
}

async function createGalleryItem(
  uploadId: string,
  category: Category,
  metadata: ArtworkMetadata,
  sourceBuffers: Buffer[],
  categoryLabel?: string,
) {
  const photos: ItemPhoto[] = [];

  for (const buffer of sourceBuffers) {
    const photoId = createImageId().slice(0, 8);
    photos.push(await storePhotoFiles(uploadId, photoId, buffer));
  }

  const image = await buildImageRecord(uploadId, category, metadata, photos);
  await addImageToManifest(image);

  await registerArtworkVocabulary({
    category,
    categoryLabel,
    medium: metadata.medium,
    dimensions: metadata.dimensions,
    year: metadata.year,
    collection: metadata.collection,
  });

  return {
    ...image,
    thumbUrl: getPublicUrl(image.thumbKey),
    fullUrl: getPublicUrl(image.fullKey),
    photos: image.photos.map((photo) => ({
      id: photo.id,
      thumbUrl: getPublicUrl(photo.thumbKey),
      fullUrl: getPublicUrl(photo.fullKey),
    })),
  };
}

function metadataFromBody(body: CompleteBody): ArtworkMetadata {
  return {
    title: body.title,
    medium: body.medium,
    dimensions: body.dimensions,
    year: body.year,
    price: body.price,
    priceOnRequest: body.priceOnRequest ?? false,
    status: body.status ?? "available",
    featured: body.featured ?? false,
    homepageHero: body.homepageHero ?? false,
    collection: body.collection,
    slug: body.slug,
    caption: body.caption,
    printSizes: body.printSizes,
    printSurfaces: body.printSurfaces,
  };
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const mode = getStorageMode();

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const files = form
      .getAll("file")
      .filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    for (const file of files) {
      const validation = validateUploadFile(file);
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const uploadId = createImageId();
    const category = parseCategory(form.get("category"));
    const metadata = parseArtworkMetadata(form);
    const buffers = await Promise.all(
      files.map((file) => file.arrayBuffer().then((ab) => Buffer.from(ab))),
    );

    const categoryLabel =
      typeof form.get("categoryLabel") === "string"
        ? form.get("categoryLabel")?.toString().trim() || undefined
        : undefined;

    const image = await createGalleryItem(
      uploadId,
      category,
      metadata,
      buffers,
      categoryLabel,
    );
    return NextResponse.json({ image });
  }

  const body = (await request.json()) as CompleteBody;

  if (mode !== "r2" || !body.uploadId || !body.tempKey) {
    return NextResponse.json(
      { error: "R2 complete requires uploadId and tempKey" },
      { status: 400 },
    );
  }

  const sourceBuffer = await getObject(body.tempKey);
  if (!sourceBuffer) {
    return NextResponse.json(
      { error: "Uploaded file not found" },
      { status: 404 },
    );
  }

  const category = parseCategory(body.category);
  const metadata = metadataFromBody(body);

  const image = await createGalleryItem(
    body.uploadId,
    category,
    metadata,
    [sourceBuffer],
    body.categoryLabel?.trim(),
  );

  await deleteObject(body.tempKey);

  return NextResponse.json({ image });
}

import { NextResponse } from "next/server";
import { getExistingSlugs } from "@/lib/gallery";
import {
  createImageId,
  parseCategory,
  validateUploadFile,
} from "@/lib/images";
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
import type { Category, GalleryImage, ItemPhoto } from "@/lib/types";

type CompleteBody = {
  uploadId?: string;
  tempKey?: string;
  category?: Category;
  caption?: string;
  title?: string;
  medium?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  priceOnRequest?: boolean;
  status?: GalleryImage["status"];
  featured?: boolean;
  collection?: string;
  slug?: string;
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
    collection: metadata.collection,
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
) {
  const photos: ItemPhoto[] = [];

  for (const buffer of sourceBuffers) {
    const photoId = createImageId().slice(0, 8);
    photos.push(await storePhotoFiles(uploadId, photoId, buffer));
  }

  const image = await buildImageRecord(uploadId, category, metadata, photos);
  await addImageToManifest(image);

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
    collection: body.collection,
    slug: body.slug,
    caption: body.caption,
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

    const image = await createGalleryItem(uploadId, category, metadata, buffers);
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

  const category = body.category === "diy" ? "diy" : "painting";
  const metadata = metadataFromBody(body);

  const image = await createGalleryItem(
    body.uploadId,
    category,
    metadata,
    [sourceBuffer],
  );

  await deleteObject(body.tempKey);

  return NextResponse.json({ image });
}

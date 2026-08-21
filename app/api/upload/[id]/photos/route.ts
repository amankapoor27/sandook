import { NextResponse } from "next/server";
import { validateUploadFile } from "@/lib/images";
import { appendPhotosToItem } from "@/lib/item-photos";
import { getPublicUrl } from "@/lib/storage";
import { MAX_PHOTOS_PER_ITEM } from "@/lib/types";

function imageWithUrls(image: Awaited<ReturnType<typeof appendPhotosToItem>>) {
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

  try {
    const buffers = await Promise.all(
      files.map((file) => file.arrayBuffer().then((ab) => Buffer.from(ab))),
    );
    const image = await appendPhotosToItem(id, buffers);
    return NextResponse.json({ image: imageWithUrls(image) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return NextResponse.json({
    maxPhotos: MAX_PHOTOS_PER_ITEM,
    itemId: id,
  });
}

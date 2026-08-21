import { NextResponse } from "next/server";
import { removePhotoFromItem } from "@/lib/item-photos";
import { deleteObject, getPublicUrl } from "@/lib/storage";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const { id, photoId } = await params;

  try {
    const { item, removed } = await removePhotoFromItem(id, photoId);
    await deleteObject(removed.thumbKey);
    await deleteObject(removed.fullKey);

    return NextResponse.json({
      image: {
        ...item,
        thumbUrl: getPublicUrl(item.thumbKey),
        fullUrl: getPublicUrl(item.fullKey),
        photos: item.photos.map((photo) => ({
          id: photo.id,
          thumbUrl: getPublicUrl(photo.thumbKey),
          fullUrl: getPublicUrl(photo.fullKey),
        })),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

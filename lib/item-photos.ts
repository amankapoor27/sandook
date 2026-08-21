import { createImageId, processImage } from "./images";
import { getManifest, updateImageInManifest } from "./manifest";
import { syncPrimaryPhoto } from "./normalize-image";
import { putObject } from "./storage";
import type { GalleryImage, ItemPhoto } from "./types";
import { MAX_PHOTOS_PER_ITEM } from "./types";

export async function storePhotoFiles(
  itemId: string,
  photoId: string,
  sourceBuffer: Buffer,
): Promise<ItemPhoto> {
  const { thumb, full } = await processImage(sourceBuffer);
  const thumbKey = `images/${itemId}/photos/${photoId}/thumb.webp`;
  const fullKey = `images/${itemId}/photos/${photoId}/full.webp`;

  await putObject(thumbKey, thumb, "image/webp");
  await putObject(fullKey, full, "image/webp");

  return { id: photoId, thumbKey, fullKey };
}

export async function appendPhotosToItem(
  itemId: string,
  buffers: Buffer[],
): Promise<GalleryImage> {
  const manifest = await getManifest();
  const item = manifest.images.find((img) => img.id === itemId);
  if (!item) throw new Error("Item not found");

  const remaining = MAX_PHOTOS_PER_ITEM - item.photos.length;
  if (remaining <= 0) {
    throw new Error(`Maximum ${MAX_PHOTOS_PER_ITEM} photos per item`);
  }

  const toAdd = buffers.slice(0, remaining);
  const newPhotos: ItemPhoto[] = [];

  for (const buffer of toAdd) {
    const photoId = createImageId().slice(0, 8);
    newPhotos.push(await storePhotoFiles(itemId, photoId, buffer));
  }

  const updated = syncPrimaryPhoto({
    ...item,
    photos: [...item.photos, ...newPhotos],
  });

  await updateImageInManifest(itemId, updated);
  return updated;
}

export async function removePhotoFromItem(
  itemId: string,
  photoId: string,
): Promise<{ item: GalleryImage; removed: ItemPhoto }> {
  const manifest = await getManifest();
  const item = manifest.images.find((img) => img.id === itemId);
  if (!item) throw new Error("Item not found");

  if (item.photos.length <= 1) {
    throw new Error("Cannot remove the only photo");
  }

  const photo = item.photos.find((p) => p.id === photoId);
  if (!photo) throw new Error("Photo not found");

  const photos = item.photos.filter((p) => p.id !== photoId);
  const updated = syncPrimaryPhoto({ ...item, photos });

  await updateImageInManifest(itemId, updated);
  return { item: updated, removed: photo };
}

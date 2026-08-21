import { getManifest } from "./manifest";
import { getPublicUrl } from "./storage";
import type { ArtworkStatus, GalleryImage, ItemPhoto } from "./types";

export { normalizeImage } from "./normalize-image";

export type ItemPhotoView = {
  id: string;
  thumbUrl: string;
  fullUrl: string;
};

export type GalleryImageView = {
  id: string;
  slug: string;
  category: GalleryImage["category"];
  caption?: string;
  title: string;
  medium?: string;
  dimensions?: string;
  year?: number;
  price?: number;
  priceOnRequest?: boolean;
  status: ArtworkStatus;
  featured?: boolean;
  collection?: string;
  thumbUrl: string;
  fullUrl: string;
  photos: ItemPhotoView[];
  uploadedAt: string;
};

function photoToView(photo: ItemPhoto): ItemPhotoView {
  return {
    id: photo.id,
    thumbUrl: getPublicUrl(photo.thumbKey),
    fullUrl: getPublicUrl(photo.fullKey),
  };
}

function toView(image: GalleryImage): GalleryImageView {
  const photos = image.photos.map(photoToView);
  const primary = photos[0];

  return {
    id: image.id,
    slug: image.slug,
    category: image.category,
    caption: image.caption,
    title: image.title,
    medium: image.medium,
    dimensions: image.dimensions,
    year: image.year,
    price: image.price,
    priceOnRequest: image.priceOnRequest,
    status: image.status,
    featured: image.featured,
    collection: image.collection,
    thumbUrl: primary?.thumbUrl ?? getPublicUrl(image.thumbKey),
    fullUrl: primary?.fullUrl ?? getPublicUrl(image.fullKey),
    photos,
    uploadedAt: image.uploadedAt,
  };
}

function sortByDate(images: GalleryImage[]): GalleryImage[] {
  return [...images].sort(
    (a, b) =>
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export async function getGalleryImages(): Promise<GalleryImageView[]> {
  const manifest = await getManifest();
  return sortByDate(manifest.images).map(toView);
}

export async function getPaintings(): Promise<GalleryImageView[]> {
  const manifest = await getManifest();
  return sortByDate(manifest.images.filter((img) => img.category === "painting")).map(
    toView,
  );
}

export async function getDiyProjects(): Promise<GalleryImageView[]> {
  const manifest = await getManifest();
  return sortByDate(manifest.images.filter((img) => img.category === "diy")).map(
    toView,
  );
}

export async function getFeaturedImages(): Promise<GalleryImageView[]> {
  const all = await getGalleryImages();
  const featured = all.filter((img) => img.featured);
  if (featured.length > 0) return featured.slice(0, 6);
  return all.slice(0, 6);
}

export async function getFeaturedPaintings(): Promise<GalleryImageView[]> {
  const paintings = await getPaintings();
  const featured = paintings.filter((img) => img.featured);
  if (featured.length > 0) return featured.slice(0, 6);
  return paintings.slice(0, 6);
}

export async function getArtworkBySlug(
  slug: string,
): Promise<GalleryImageView | null> {
  const manifest = await getManifest();
  const image = manifest.images.find((img) => img.slug === slug);
  return image ? toView(image) : null;
}

export async function getAdjacentArtwork(slug: string): Promise<{
  prev: GalleryImageView | null;
  next: GalleryImageView | null;
}> {
  const images = await getGalleryImages();
  const index = images.findIndex((img) => img.slug === slug);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: index > 0 ? images[index - 1] : null,
    next: index < images.length - 1 ? images[index + 1] : null,
  };
}

export async function getCollections(): Promise<string[]> {
  const manifest = await getManifest();
  const collections = new Set<string>();
  for (const image of manifest.images) {
    if (image.category === "painting" && image.collection?.trim()) {
      collections.add(image.collection.trim());
    }
  }
  return [...collections].sort((a, b) => a.localeCompare(b));
}

export async function getExistingSlugs(): Promise<string[]> {
  const manifest = await getManifest();
  return manifest.images.map((img) => img.slug);
}

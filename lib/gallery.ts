import { orderedCollectionNames, sortImagesByCollection } from "./collection-order";
import { getManifest } from "./manifest";
import { usesPrintFieldSet } from "./category-utils";
import { getVocabulary } from "./vocabulary";
import { getPublicUrl } from "./storage";
import type { ArtworkStatus, GalleryImage, ItemPhoto } from "./types";

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
  homepageHero?: boolean;
  collection?: string;
  thumbUrl: string;
  fullUrl: string;
  photos: ItemPhotoView[];
  printSizes?: string[];
  printSurfaces?: string[];
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
    homepageHero: image.homepageHero,
    collection: image.collection,
    printSizes: image.printSizes,
    printSurfaces: image.printSurfaces,
    thumbUrl: primary?.thumbUrl ?? getPublicUrl(image.thumbKey),
    fullUrl: primary?.fullUrl ?? getPublicUrl(image.fullKey),
    photos,
    uploadedAt: image.uploadedAt,
  };
}

async function getSortedGalleryImages(): Promise<GalleryImage[]> {
  const [manifest, vocabulary] = await Promise.all([
    getManifest(),
    getVocabulary(),
  ]);
  return sortImagesByCollection(manifest.images, vocabulary);
}

export async function getGalleryImages(): Promise<GalleryImageView[]> {
  const images = await getSortedGalleryImages();
  return images.map(toView);
}

export async function getFeaturedImages(): Promise<GalleryImageView[]> {
  const all = await getGalleryImages();
  const featured = all.filter((img) => img.featured);
  if (featured.length > 0) return featured.slice(0, 6);
  return all.slice(0, 6);
}

export async function getHomepageHeroImage(): Promise<GalleryImageView | null> {
  const manifest = await getManifest();
  const hero = manifest.images.find((image) => image.homepageHero);
  return hero ? toView(hero) : null;
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
  const [manifest, vocabulary] = await Promise.all([
    getManifest(),
    getVocabulary(),
  ]);
  const collections: string[] = [];
  for (const image of manifest.images) {
    if (
      !usesPrintFieldSet(image.category, vocabulary.categories) &&
      image.collection?.trim()
    ) {
      collections.push(image.collection.trim());
    }
  }
  return orderedCollectionNames(vocabulary, collections);
}

export async function getExistingSlugs(): Promise<string[]> {
  const manifest = await getManifest();
  return manifest.images.map((img) => img.slug);
}

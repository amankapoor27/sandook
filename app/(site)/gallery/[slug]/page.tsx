import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArtworkDetail,
  artworkJsonLd,
} from "@/components/work/ArtworkDetail";
import {
  getAdjacentArtwork,
  getArtworkBySlug,
  getGalleryImages,
} from "@/lib/gallery";
import { recordArtworkView } from "@/lib/analytics";
import { readPageReferrerSource } from "@/lib/analytics-referrer";
import { parseGalleryCategory } from "@/lib/gallery-nav";
import { siteConfig } from "@/lib/site";
import { syncVocabularyFromManifest } from "@/lib/vocabulary";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateStaticParams() {
  const images = await getGalleryImages();
  return images.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return { title: "Not found" };

  return {
    title: artwork.title,
    description:
      artwork.caption ??
      `${artwork.title} — ${siteConfig.artistName}`,
    openGraph: {
      title: artwork.title,
      images: [{ url: artwork.fullUrl }],
    },
  };
}

export default async function GalleryItemPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { category } = await searchParams;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const galleryCategory = parseGalleryCategory(category ?? artwork.category);
  const { prev, next } = await getAdjacentArtwork(slug);
  const vocabulary = await syncVocabularyFromManifest();
  const jsonLd = artworkJsonLd(artwork);

  await recordArtworkView(slug, await readPageReferrerSource());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArtworkDetail
        artwork={artwork}
        prev={prev}
        next={next}
        galleryCategory={galleryCategory}
        categories={vocabulary.categories}
      />
    </>
  );
}

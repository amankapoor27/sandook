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
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
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

export default async function GalleryItemPage({ params }: PageProps) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const { prev, next } = await getAdjacentArtwork(slug);
  const jsonLd = artworkJsonLd(artwork);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArtworkDetail artwork={artwork} prev={prev} next={next} />
    </>
  );
}

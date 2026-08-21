import type { Metadata } from "next";
import { GalleryView } from "@/components/gallery/GalleryView";
import { getCollections, getGalleryImages } from "@/lib/gallery";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: `Paintings and handmade work by ${siteConfig.artistName}.`,
};

export default async function GalleryPage() {
  const [images, collections] = await Promise.all([
    getGalleryImages(),
    getCollections(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-12">
        <p className="section-label mb-3">Collection</p>
        <h1 className="font-display text-4xl font-normal text-foreground md:text-5xl">
          Gallery
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Original paintings and studio projects — each piece made by hand.
        </p>
      </header>
      <GalleryView images={images} collections={collections} />
    </div>
  );
}

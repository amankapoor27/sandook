import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryView } from "@/components/gallery/GalleryView";
import { getCollections, getGalleryImages } from "@/lib/gallery";
import { recordGalleryView } from "@/lib/analytics";
import { readPageReferrerSource } from "@/lib/analytics-referrer";
import { getManifest } from "@/lib/manifest";
import { siteConfig } from "@/lib/site";
import {
  buildGalleryCategoryTabs,
  syncVocabularyFromManifest,
} from "@/lib/vocabulary";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Gallery",
  description: `Paintings and handmade work by ${siteConfig.artistName}.`,
};

export default async function GalleryPage() {
  const [images, vocabulary, collections, manifest] = await Promise.all([
    getGalleryImages(),
    syncVocabularyFromManifest(),
    getCollections(),
    getManifest(),
  ]);
  const categoryTabs = buildGalleryCategoryTabs(manifest.images, vocabulary);

  const source = await readPageReferrerSource();
  await recordGalleryView(source);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-12">
        <p className="section-label mb-3">Collection</p>
        <h1 className="font-display text-4xl font-normal text-foreground md:text-5xl">
          Gallery
        </h1>
        <p className="mt-4 max-w-lg text-muted">
          Original paintings and art prints from the studio.
        </p>
      </header>
      <Suspense fallback={<p className="text-sm text-muted">Loading gallery…</p>}>
        <GalleryView
          images={images}
          collections={collections}
          categoryTabs={categoryTabs}
          categories={vocabulary.categories}
        />
      </Suspense>
    </div>
  );
}

import { AboutSnippet } from "@/components/home/AboutSnippet";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { getFeaturedImages, getGalleryImages } from "@/lib/gallery";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, allImages] = await Promise.all([
    getFeaturedImages(),
    getGalleryImages(),
  ]);

  const heroPiece =
    featured.find((img) => img.category === "painting") ??
    featured[0] ??
    allImages.find((img) => img.category === "painting") ??
    allImages[0] ??
    null;

  return (
    <>
      <Hero featured={heroPiece} />
      <FeaturedWork images={featured} excludeSlug={heroPiece?.slug} />
      <AboutSnippet />
    </>
  );
}

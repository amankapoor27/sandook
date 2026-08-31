import { AboutSnippet } from "@/components/home/AboutSnippet";
import { FeaturedWork } from "@/components/home/FeaturedWork";
import { Hero } from "@/components/home/Hero";
import { readPageReferrerSource } from "@/lib/analytics-referrer";
import { recordHomepageView } from "@/lib/analytics";
import { getFeaturedImages, getHomepageHeroImage } from "@/lib/gallery";

export const revalidate = 60;

export default async function HomePage() {
  const [heroPiece, featured, source] = await Promise.all([
    getHomepageHeroImage(),
    getFeaturedImages(),
    readPageReferrerSource(),
  ]);

  await recordHomepageView(source);

  return (
    <>
      <Hero featured={heroPiece} />
      <FeaturedWork images={featured} excludeSlug={heroPiece?.slug} />
      <AboutSnippet />
    </>
  );
}

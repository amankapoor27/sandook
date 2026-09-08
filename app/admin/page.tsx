import { AdminClient } from "@/components/admin/AdminClient";
import { normalizeAdminGalleryImages } from "@/lib/admin-gallery";
import { getGalleryImages } from "@/lib/gallery";
import { syncVocabularyFromManifest } from "@/lib/vocabulary";

export default async function AdminPage() {
  const [images, vocabulary] = await Promise.all([
    getGalleryImages(),
    syncVocabularyFromManifest(),
  ]);

  return (
    <AdminClient
      initialImages={normalizeAdminGalleryImages(images)}
      initialVocabulary={vocabulary}
    />
  );
}

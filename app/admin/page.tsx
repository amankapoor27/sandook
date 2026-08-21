import { AdminClient } from "@/components/admin/AdminClient";
import { getGalleryImages } from "@/lib/gallery";

export default async function AdminPage() {
  const images = await getGalleryImages();

  return <AdminClient initialImages={images} />;
}

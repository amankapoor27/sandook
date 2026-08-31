import { VocabularyClient } from "@/components/admin/VocabularyClient";
import { syncVocabularyFromManifest } from "@/lib/vocabulary";

export default async function AdminVocabularyPage() {
  const vocabulary = await syncVocabularyFromManifest();

  return <VocabularyClient initialVocabulary={vocabulary} />;
}

import { InquiriesClient } from "@/components/admin/InquiriesClient";
import { listArchivedInquiries, listInquiries } from "@/lib/inquiry";

export default async function AdminInquiriesPage() {
  const [inquiries, archived] = await Promise.all([
    listInquiries(),
    listArchivedInquiries(),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
        <p className="mt-1 text-sm text-muted">
          Contact form submissions — archive when handled, delete to remove
          permanently.
        </p>
      </div>
      <InquiriesClient
        initialInquiries={inquiries}
        initialArchived={archived}
      />
    </div>
  );
}

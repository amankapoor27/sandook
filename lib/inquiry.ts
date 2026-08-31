import { sendInquiryNotification } from "./mail";
import { appendInquiry, createInquiryId } from "./inquiry-store";
import type { Inquiry, InquiryType } from "./types";

type InquiryInput = {
  type: InquiryType;
  name: string;
  email: string;
  message: string;
  artworkSlug?: string;
  artworkTitle?: string;
};

export {
  listInquiries,
  listArchivedInquiries,
  deleteInquiry,
  archiveInquiry,
} from "./inquiry-store";

export async function saveInquiry(input: InquiryInput): Promise<Inquiry> {
  const inquiry: Inquiry = {
    id: createInquiryId(),
    type: input.type,
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
    artworkSlug: input.artworkSlug,
    artworkTitle: input.artworkTitle,
    createdAt: new Date().toISOString(),
  };

  await appendInquiry(inquiry);

  const channel = await sendInquiryNotification(inquiry).catch((error) => {
    console.error("Inquiry email notification failed:", error);
    return "none" as const;
  });

  if (process.env.NODE_ENV === "development" && channel === "none") {
    console.warn(
      `[sandook] Inquiry ${inquiry.id} saved. Email not sent — check SMTP_* vars in .env.local and restart dev server.`,
    );
  }

  return inquiry;
}

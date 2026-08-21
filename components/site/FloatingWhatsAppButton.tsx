"use client";

import { WhatsAppButton } from "./WhatsAppButton";
import { isWhatsAppConfigured, whatsAppGeneralUrl } from "@/lib/whatsapp";

export function FloatingWhatsAppButton() {
  if (!isWhatsAppConfigured()) return null;

  return (
    <WhatsAppButton
      href={whatsAppGeneralUrl()}
      label="Chat on WhatsApp"
      variant="fab"
    />
  );
}

import type { GalleryImage } from "./types";

export const siteConfig = {
  artistName: "Sandook Studio",
  tagline: "Original paintings, made by hand",
  about: `Sandook Studio is a personal art practice rooted in colour, texture, and everyday inspiration. Each painting is an original work — layered, considered, and made by hand in the studio.

This site is a living archive of finished pieces, works in progress, and the occasional DIY experiment that spills over from the easel.`,
  commissions: {
    open: true,
    summary:
      "Commission slots are open for original paintings — portraits, landscapes, abstracts, and custom sizes.",
    details: `I take a small number of commissions each season. Share your idea, preferred size, and timeline — I'll reply with availability and a quote.

Typical turnaround is 4–8 weeks depending on size and complexity. A 50% deposit secures your slot; the balance is due on completion before shipping.`,
    process: [
      "Share your vision — reference images, size, and budget help",
      "Receive a quote and timeline within 2–3 business days",
      "Approve a colour sketch or reference board before painting begins",
      "Progress photos at key stages; final approval before delivery",
    ],
  },
  instagram: "https://instagram.com/sandookstudio",
  email: "hello@sandook.studio",
  /** International format, no + or spaces — e.g. 919876543210. Set via NEXT_PUBLIC_WHATSAPP_NUMBER. */
  get whatsapp() {
    return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ?? "";
  },
  currency: "INR" as const,
  get siteUrl() {
    return (
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      "http://localhost:3000"
    );
  },
};

export function formatPrice(
  price: number | undefined,
  priceOnRequest?: boolean,
): string {
  if (priceOnRequest) return "Price on request";
  if (price == null) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: siteConfig.currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function statusLabel(status: GalleryImage["status"]): string {
  switch (status) {
    case "available":
      return "Available";
    case "sold":
      return "Sold";
    case "not_for_sale":
      return "Not for sale";
  }
}

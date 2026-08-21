import { formatPrice, siteConfig } from "./site";

function getWhatsAppNumber(): string {
  return siteConfig.whatsapp.replace(/\D/g, "");
}

export function isWhatsAppConfigured(): boolean {
  return getWhatsAppNumber().length >= 10;
}

export function buildWhatsAppUrl(message: string): string {
  const number = getWhatsAppNumber();
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function generalMessage(): string {
  return `Hi ${siteConfig.artistName}! I found your work on your website and would like to get in touch.`;
}

export function artworkInquiryMessage(
  title: string,
  slug: string,
  price?: number,
  priceOnRequest?: boolean,
): string {
  const url = `${siteConfig.siteUrl}/gallery/${slug}`;
  const priceLine =
    price != null && !priceOnRequest
      ? ` (${formatPrice(price)})`
      : priceOnRequest
        ? " (price on request)"
        : "";

  return `Hi! I'm interested in "${title}"${priceLine} on your website (${url}). Is it still available?`;
}

export function commissionMessage(): string {
  return `Hi ${siteConfig.artistName}! I'd like to discuss a commission. Could you share availability and pricing?`;
}

export function contactMessage(): string {
  return `Hi ${siteConfig.artistName}! I have a question about your work.`;
}

export function whatsAppGeneralUrl(): string {
  return buildWhatsAppUrl(generalMessage());
}

export function whatsAppArtworkUrl(
  title: string,
  slug: string,
  price?: number,
  priceOnRequest?: boolean,
): string {
  return buildWhatsAppUrl(
    artworkInquiryMessage(title, slug, price, priceOnRequest),
  );
}

export function whatsAppCommissionUrl(): string {
  return buildWhatsAppUrl(commissionMessage());
}

export function whatsAppContactUrl(): string {
  return buildWhatsAppUrl(contactMessage());
}

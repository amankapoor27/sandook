import Link from "next/link";
import { Logo } from "./Logo";
import { siteConfig } from "@/lib/site";
import { isWhatsAppConfigured, whatsAppGeneralUrl } from "@/lib/whatsapp";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            {siteConfig.tagline}
          </p>
          {siteConfig.commissions.open && (
            <span className="inline-block text-[0.625rem] font-medium uppercase tracking-[0.2em] text-accent">
              Commissions open
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 text-sm text-muted">
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent"
          >
            Instagram
          </a>
          {isWhatsAppConfigured() && (
            <a
              href={whatsAppGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent"
            >
              WhatsApp
            </a>
          )}
          <a href={`mailto:${siteConfig.email}`} className="hover:text-accent">
            {siteConfig.email}
          </a>
          <Link href="/commissions" className="hover:text-accent">
            Commission a painting
          </Link>
        </div>
      </div>

      <div className="border-t border-line px-6 py-5 text-center text-[0.6875rem] uppercase tracking-[0.16em] text-muted">
        © {year} {siteConfig.artistName}. All rights reserved.
      </div>
    </footer>
  );
}

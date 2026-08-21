import type { Metadata } from "next";
import { Suspense } from "react";
import { InquiryForm } from "@/components/contact/InquiryForm";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { siteConfig } from "@/lib/site";
import { isWhatsAppConfigured, whatsAppContactUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.artistName} for purchases, commissions, or general inquiries.`,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-medium text-foreground">
        Contact
      </h1>
      <p className="mt-3 text-muted">
        Questions about a piece, commissions, or collaborations — send a message
        and I&apos;ll reply within a few business days.
      </p>

      <div className="mt-6 space-y-2 text-sm text-muted">
        <p>
          Email:{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="text-accent hover:text-accent-hover"
          >
            {siteConfig.email}
          </a>
        </p>
        <p>
          Instagram:{" "}
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            @sandookstudio
          </a>
        </p>
      </div>

      {isWhatsAppConfigured() && (
        <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
          <p className="font-medium text-foreground">Prefer WhatsApp?</p>
          <p className="mt-1 text-sm text-muted">
            Chat directly — usually the fastest way to reach me.
          </p>
          <div className="mt-4">
            <WhatsAppButton
              href={whatsAppContactUrl()}
              label="Open WhatsApp"
            />
          </div>
        </div>
      )}

      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted">Loading form…</p>}>
          <InquiryForm />
        </Suspense>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { siteConfig } from "@/lib/site";
import { isWhatsAppConfigured, whatsAppCommissionUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Commissions",
  description: siteConfig.commissions.summary,
};

export default function CommissionsPage() {
  const { commissions } = siteConfig;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-medium text-foreground">
          Commissions
        </h1>
        {commissions.open && (
          <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
            Currently accepting
          </span>
        )}
      </div>

      <p className="mt-4 text-lg text-muted">{commissions.summary}</p>

      <div className="prose-site mt-8 space-y-4 text-base leading-relaxed text-muted">
        {commissions.details.split("\n\n").map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-medium text-foreground">
          How it works
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-muted">
          {commissions.process.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/contact?type=commission"
          className="inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Request a commission
        </Link>
        {isWhatsAppConfigured() && (
          <WhatsAppButton
            href={whatsAppCommissionUrl()}
            label="Discuss on WhatsApp"
          />
        )}
      </div>
    </div>
  );
}

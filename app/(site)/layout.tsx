import type { Viewport } from "next";
import { PageShell } from "@/components/site/PageShell";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#12100e" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site-theme">
      <PageShell>{children}</PageShell>
    </div>
  );
}

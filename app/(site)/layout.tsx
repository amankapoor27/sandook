import { PageShell } from "@/components/site/PageShell";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <PageShell>{children}</PageShell>;
}

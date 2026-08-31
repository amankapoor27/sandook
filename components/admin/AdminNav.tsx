"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const links = [
  { href: "/admin", label: "Gallery" },
  { href: "/admin/vocabulary", label: "Lists" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <p className="text-sm font-medium text-muted">Sandook Admin</p>
          <nav className="flex gap-1">
            {links.map(({ href, label }) => {
              const active =
                href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`btn select-none ${
                    active ? "btn-primary" : "btn-ghost text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle className="h-9 w-9" />
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="btn btn-secondary"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

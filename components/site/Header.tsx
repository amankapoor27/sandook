import Link from "next/link";
import { Logo } from "./Logo";

const navLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "About" },
  { href: "/commissions", label: "Commissions" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-8 px-6 py-5">
        <Logo />

        <nav
          aria-label="Main"
          className="hidden items-center gap-8 md:flex"
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-[0.8125rem] font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <nav
          aria-label="Mobile"
          className="flex items-center gap-4 md:hidden"
        >
          <Link
            href="/gallery"
            className="text-xs font-medium uppercase tracking-[0.12em] text-muted hover:text-foreground"
          >
            Gallery
          </Link>
          <Link
            href="/contact"
            className="text-xs font-medium uppercase tracking-[0.12em] text-accent"
          >
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}

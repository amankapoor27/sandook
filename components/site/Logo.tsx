import Link from "next/link";
import { siteConfig } from "@/lib/site";

type LogoProps = {
  variant?: "full" | "mark";
  className?: string;
};

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="4"
        y="14"
        width="32"
        height="22"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M4 18 L20 10 L36 18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M20 10 V14"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M14 22 H26"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function Logo({ variant = "full", className = "" }: LogoProps) {
  if (variant === "mark") {
    return (
      <Link
        href="/"
        aria-label={siteConfig.artistName}
        className={`inline-flex text-foreground transition-opacity hover:opacity-80 ${className}`}
      >
        <LogoMark className="h-9 w-9" />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-3 transition-opacity hover:opacity-85 ${className}`}
    >
      <LogoMark className="h-10 w-10 shrink-0 text-accent" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-xl font-medium tracking-tight text-foreground sm:text-[1.35rem]">
          Sandook
        </span>
        <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.28em] text-muted">
          Studio
        </span>
      </span>
    </Link>
  );
}

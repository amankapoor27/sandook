"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { galleryHref, type GalleryCategoryFilter } from "@/lib/gallery-nav";

type ArtworkDetailShellProps = {
  children: React.ReactNode;
  galleryCategory: GalleryCategoryFilter;
};

export function ArtworkDetailShell({
  children,
  galleryCategory,
}: ArtworkDetailShellProps) {
  const router = useRouter();

  function returnToGallery() {
    router.push(galleryHref(galleryCategory));
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const galleryUrl = galleryHref(galleryCategory);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.push(galleryUrl);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [galleryCategory, router]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <button
        type="button"
        className="artwork-backdrop fixed inset-0"
        aria-label="Close and return to gallery"
        onClick={returnToGallery}
      />
      <div className="relative z-10 flex min-h-full justify-center px-4 py-8 sm:px-6 sm:py-12 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl">{children}</div>
      </div>
    </div>
  );
}

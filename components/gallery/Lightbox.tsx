"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { GalleryImageView } from "@/lib/gallery";

type LightboxProps = {
  image: GalleryImageView | null;
  onClose: () => void;
};

function LightboxContent({
  image,
  onClose,
}: {
  image: GalleryImageView;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const photos = image.photos;
  const count = photos.length;
  const current = photos[index] ?? photos[0];

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index, onClose]);

  if (!current) return null;

  return (
    <div
      className="relative max-h-[85vh] max-w-5xl"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="group relative flex min-h-[40vh] items-center justify-center">
        <Image
          key={current.id}
          src={current.fullUrl}
          alt={`${image.title} — photo ${index + 1} of ${count}`}
          width={1600}
          height={1200}
          className="max-h-[75vh] w-auto rounded-lg object-contain"
          priority
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
              className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
              className="absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              →
            </button>
            <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-zinc-400">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {(image.title || image.caption) && (
        <p className="mt-3 text-center text-sm text-zinc-300">
          {image.title}
          {image.caption && image.caption !== image.title
            ? ` — ${image.caption}`
            : ""}
        </p>
      )}
    </div>
  );
}

export function Lightbox({ image, onClose }: LightboxProps) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white hover:bg-white/20"
      >
        Close
      </button>

      <LightboxContent key={image.id} image={image} onClose={onClose} />
    </div>
  );
}

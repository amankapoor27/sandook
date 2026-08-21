"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ItemPhotoView } from "@/lib/gallery";

type ImageCarouselProps = {
  photos: ItemPhotoView[];
  title: string;
};

export function ImageCarousel({ photos, title }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
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
      if (event.key === "ArrowLeft") goTo(index - 1);
      if (event.key === "ArrowRight") goTo(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goTo, index]);

  if (!current) return null;

  return (
    <div className="space-y-4">
      <div className="group relative aspect-[4/3] w-full overflow-hidden bg-line sm:aspect-[3/2] lg:aspect-auto lg:h-[min(70vh,720px)] lg:min-h-[360px]">
        <Image
          key={current.id}
          src={current.fullUrl}
          alt={`${title} — photo ${index + 1} of ${count}`}
          fill
          priority={index === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-contain p-2"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:bg-background"
            >
              →
            </button>
            <p className="absolute bottom-3 right-3 rounded-full bg-background/90 px-2.5 py-1 text-xs text-muted">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setIndex(photoIndex)}
              aria-label={`View photo ${photoIndex + 1}`}
              aria-current={photoIndex === index}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border-2 transition-colors ${
                photoIndex === index
                  ? "border-accent"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={photo.fullUrl}
                alt=""
                fill
                sizes="64px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

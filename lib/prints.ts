import type { GalleryImageView } from "./gallery";
import { PRINT_SIZES, PRINT_SURFACES } from "./types";

export function resolvePrintSizes(
  image: Pick<GalleryImageView, "printSizes">,
): string[] {
  return image.printSizes?.length ? image.printSizes : [...PRINT_SIZES];
}

export function resolvePrintSurfaces(
  image: Pick<GalleryImageView, "printSurfaces">,
): string[] {
  return image.printSurfaces?.length ? image.printSurfaces : [...PRINT_SURFACES];
}

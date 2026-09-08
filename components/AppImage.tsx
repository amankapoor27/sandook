import NextImage, { type ImageProps } from "next/image";

/** Gallery media is served from /api/media; Workers cannot optimize those via /_next/image. */
export function AppImage(props: ImageProps) {
  return <NextImage {...props} unoptimized />;
}

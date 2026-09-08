import type { PhotonImage } from "@cf-wasm/photon/workerd";
import { getPhoton } from "./photon";
import { isCloudflareWorkers } from "./runtime";

const WATERMARK_TEXT = "Sandook studio";

export async function ensurePhoton(): Promise<void> {
  await getPhoton();
}

export async function applyWatermarkToImageAsync(image: PhotonImage): Promise<void> {
  // draw_text_with_color needs fonts that are not available on Workers (Rust null pointer).
  if (isCloudflareWorkers()) return;
  const { Rgba, draw_text_with_color } = await getPhoton();
  const width = image.get_width();
  const height = image.get_height();
  if (!width || !height) return;

  const fontSize = Math.max(16, Math.min(28, Math.round(width / 28)));
  const color = new Rgba(255, 255, 255, 66);

  const tileWidth = 260;
  const tileHeight = 110;
  for (let y = -tileHeight; y < height + tileHeight; y += tileHeight) {
    for (let x = -tileWidth; x < width + tileWidth; x += tileWidth) {
      draw_text_with_color(
        image,
        WATERMARK_TEXT,
        x + 12,
        y + 58,
        fontSize,
        color,
      );
    }
  }
}

export async function applyWatermark(buffer: Buffer): Promise<Buffer> {
  const { PhotonImage } = await getPhoton();
  const image = PhotonImage.new_from_byteslice(new Uint8Array(buffer));
  await applyWatermarkToImageAsync(image);
  return Buffer.from(image.get_bytes_webp());
}

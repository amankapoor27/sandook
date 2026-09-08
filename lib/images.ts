import type { PhotonImage } from "@cf-wasm/photon/workerd";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./constants";
import { getPhoton } from "./photon";
import { applyWatermarkToImageAsync } from "./watermark";

export type ProcessedImage = {
  thumb: Buffer;
  full: Buffer;
};

const MAX_PIXELS = 20_000_000; // ~20MP — keeps Workers under memory limits

function mimeFromFilename(name: string): string | undefined {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    default:
      return undefined;
  }
}

function loadImage(
  mod: Awaited<ReturnType<typeof getPhoton>>,
  buffer: Buffer,
): PhotonImage {
  return mod.PhotonImage.new_from_byteslice(new Uint8Array(buffer));
}

function fitInside(
  mod: Awaited<ReturnType<typeof getPhoton>>,
  image: PhotonImage,
  maxWidth: number,
  maxHeight: number,
): PhotonImage {
  const width = image.get_width();
  const height = image.get_height();
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  const nextWidth = Math.max(1, Math.round(width * scale));
  const nextHeight = Math.max(1, Math.round(height * scale));
  return mod.resize(image, nextWidth, nextHeight, mod.SamplingFilter.Lanczos3);
}

function coverCrop(
  mod: Awaited<ReturnType<typeof getPhoton>>,
  image: PhotonImage,
  targetWidth: number,
  targetHeight: number,
): PhotonImage {
  const width = image.get_width();
  const height = image.get_height();
  const scale = Math.max(targetWidth / width, targetHeight / height);
  const scaledWidth = Math.max(1, Math.round(width * scale));
  const scaledHeight = Math.max(1, Math.round(height * scale));
  const resized = mod.resize(
    image,
    scaledWidth,
    scaledHeight,
    mod.SamplingFilter.Lanczos3,
  );
  const x1 = Math.max(0, Math.floor((scaledWidth - targetWidth) / 2));
  const y1 = Math.max(0, Math.floor((scaledHeight - targetHeight) / 2));
  return mod.crop(resized, x1, y1, x1 + targetWidth, y1 + targetHeight);
}

async function encodeVariant(
  mod: Awaited<ReturnType<typeof getPhoton>>,
  source: PhotonImage,
  variant: "full" | "thumb",
): Promise<Buffer> {
  const processed =
    variant === "full"
      ? fitInside(mod, source, 2000, 2000)
      : coverCrop(mod, source, 600, 400);

  await applyWatermarkToImageAsync(processed);
  return Buffer.from(processed.get_bytes_webp());
}

export function validateUploadFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  const mime =
    file.type ||
    mimeFromFilename(typeof file.name === "string" ? file.name : "") ||
    "";

  if (!ALLOWED_MIME_TYPES.includes(mime as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { ok: false, error: "Unsupported file type. Use JPEG, PNG, or WebP." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: "File exceeds 15 MB limit." };
  }

  return { ok: true };
}

export async function validateImageBuffer(
  buffer: Buffer,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const mod = await getPhoton();
    const image = loadImage(mod, buffer);
    const width = image.get_width();
    const height = image.get_height();
    if (!width || !height) {
      return { ok: false, error: "Invalid image file." };
    }
    if (width * height > MAX_PIXELS) {
      return {
        ok: false,
        error: "Image is too large to process. Use a file under ~20 megapixels.",
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid image file." };
  }
}

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const validation = await validateImageBuffer(buffer);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const mod = await getPhoton();

  // Sequential — parallel decode can exceed Workers' 128MB memory cap.
  const full = await encodeVariant(mod, loadImage(mod, buffer), "full");
  const thumb = await encodeVariant(mod, loadImage(mod, buffer), "thumb");

  return { thumb, full };
}

export function createImageId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

import sharp, { type ResizeOptions } from "sharp";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./constants";
import { applyWatermark } from "./watermark";

export type ProcessedImage = {
  thumb: Buffer;
  full: Buffer;
};

export function validateUploadFile(
  file: File,
): { ok: true } | { ok: false; error: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number])) {
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
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return { ok: false, error: "Invalid image file." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Invalid image file." };
  }
}

async function encodeVariant(
  buffer: Buffer,
  resize: ResizeOptions,
  quality: number,
): Promise<Buffer> {
  const resized = await sharp(buffer)
    .rotate()
    .resize(resize)
    .webp({ quality })
    .toBuffer();

  return applyWatermark(resized);
}

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const validation = await validateImageBuffer(buffer);
  if (!validation.ok) {
    throw new Error(validation.error);
  }

  const [full, thumb] = await Promise.all([
    encodeVariant(
      buffer,
      { width: 2000, height: 2000, fit: "inside", withoutEnlargement: true },
      85,
    ),
    // 3:2 matches gallery grid aspect (sm+); object-cover in GalleryGrid crops to fit.
    encodeVariant(
      buffer,
      {
        width: 600,
        height: 400,
        fit: "cover",
        position: "centre",
      },
      80,
    ),
  ]);

  return { thumb, full };
}

export function createImageId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

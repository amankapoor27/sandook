import sharp from "sharp";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from "./constants";
import type { Category } from "./types";

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

export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const full = await sharp(buffer)
    .rotate()
    .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const thumb = await sharp(buffer)
    .rotate()
    .resize({
      width: 400,
      height: 400,
      fit: "contain",
      background: { r: 217, g: 209, b: 199, alpha: 1 },
    })
    .webp({ quality: 80 })
    .toBuffer();

  return { thumb, full };
}

export function parseCategory(value: FormDataEntryValue | null): Category {
  return value === "diy" ? "diy" : "painting";
}

export function parseCaption(value: FormDataEntryValue | null): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 200) : undefined;
}

export function createImageId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

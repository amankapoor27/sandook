import fs from "fs/promises";
import path from "path";
import { normalizeImage } from "./normalize-image";
import type { GalleryImage, Manifest } from "./types";
import { getObject, putObject } from "./storage";
import { isR2Configured } from "./env";

const MANIFEST_KEY = "manifest.json";
const LOCAL_MANIFEST = path.join(process.cwd(), "data", "mock-manifest.json");

function normalizeManifest(manifest: Manifest): Manifest {
  return {
    images: manifest.images.map((img) =>
      normalizeImage(img as Parameters<typeof normalizeImage>[0]),
    ),
  };
}

export async function getManifest(): Promise<Manifest> {
  const stored = await getObject(MANIFEST_KEY);
  if (stored) {
    return normalizeManifest(JSON.parse(stored.toString("utf-8")) as Manifest);
  }

  if (!isR2Configured()) {
    try {
      const raw = await fs.readFile(LOCAL_MANIFEST, "utf-8");
      return normalizeManifest(JSON.parse(raw) as Manifest);
    } catch {
      return { images: [] };
    }
  }

  return { images: [] };
}

export async function putManifest(manifest: Manifest): Promise<void> {
  const normalized = normalizeManifest(manifest);
  const body = Buffer.from(JSON.stringify(normalized, null, 2), "utf-8");
  await putObject(MANIFEST_KEY, body, "application/json");

  if (!isR2Configured()) {
    await fs.writeFile(LOCAL_MANIFEST, body);
  }
}

export async function addImageToManifest(
  image: GalleryImage,
): Promise<Manifest> {
  const manifest = await getManifest();
  manifest.images.unshift(normalizeImage(image));
  await putManifest(manifest);
  return manifest;
}

export async function updateImageInManifest(
  id: string,
  updates: Partial<GalleryImage>,
): Promise<Manifest> {
  const manifest = await getManifest();
  const index = manifest.images.findIndex((img) => img.id === id);
  if (index === -1) {
    throw new Error("Image not found");
  }

  manifest.images[index] = normalizeImage({
    ...manifest.images[index],
    ...updates,
  });
  await putManifest(manifest);
  return manifest;
}

export async function removeImageFromManifest(id: string): Promise<Manifest> {
  const manifest = await getManifest();
  manifest.images = manifest.images.filter((img) => img.id !== id);
  await putManifest(manifest);
  return manifest;
}

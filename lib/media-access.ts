import path from "path";

const ALLOWED_EXTENSIONS = new Set(["webp", "jpg", "jpeg", "png"]);

export function resolvePublicMediaKey(segments: string[]): string | null {
  if (segments.length === 0) return null;

  const decoded = segments.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return null;
    }
  });

  if (decoded.some((segment) => segment == null || segment === "")) {
    return null;
  }

  const key = path.posix.normalize(decoded.join("/"));
  if (key.startsWith("../") || key.includes("/../") || key === "..") {
    return null;
  }

  if (!key.startsWith("images/")) return null;

  const extension = key.split(".").pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) return null;

  return key;
}

export function contentTypeForMediaKey(key: string): string {
  const extension = key.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

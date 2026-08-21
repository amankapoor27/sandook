export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uniqueSlug(base: string, existing: string[]): string {
  const normalized = slugify(base) || "untitled";
  if (!existing.includes(normalized)) return normalized;

  let counter = 2;
  while (existing.includes(`${normalized}-${counter}`)) {
    counter += 1;
  }
  return `${normalized}-${counter}`;
}

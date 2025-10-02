// src/lib/strings.ts
export function slugify(input?: string): string {
  const s = (input ?? "").toLowerCase().trim();
  // No replaceAll — works in all target browsers
  return s
    .replace(/\s+/g, "-")       // spaces -> dashes
    .replace(/[^a-z0-9-]/g, "") // strip non-url chars
    .replace(/-+/g, "-");       // collapse multiple dashes
}

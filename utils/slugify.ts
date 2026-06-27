/**
 * Generates a URL-friendly slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // Remove non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-')     // Replace spaces, underscores, and hyphens with a single hyphen
    .replace(/^-+|-+$/g, '');     // Trim leading and trailing hyphens
}

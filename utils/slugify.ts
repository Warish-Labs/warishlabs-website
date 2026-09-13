/**
 * Generates a URL-friendly slug from a string
 */
export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .split('-')
    .filter(Boolean)
    .join('-');
}

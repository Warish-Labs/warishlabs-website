// lib/sanitize-client.ts
import DOMPurify from 'dompurify';

export function sanitizeClient(html: string): string {
  if (typeof window === 'undefined') {
    // During SSR, return the html as-is. It will be sanitized on the client upon hydration.
    return html;
  }
  return DOMPurify.sanitize(html);
}

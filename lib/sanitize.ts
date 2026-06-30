// lib/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import DOMPurify from 'dompurify';

export function sanitizeServer(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading', 'srcset'],
    },
  });
}

export function sanitizeClient(html: string): string {
  return DOMPurify.sanitize(html);
}

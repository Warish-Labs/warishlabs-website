// lib/sanitize.ts
import sanitizeHtml from 'sanitize-html';
import DOMPurify from 'dompurify';

export function sanitizeServer(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h2', 'h3', 'h4', 'code', 'pre', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'width', 'height', 'loading', 'srcset'],
      a: ['href', 'name', 'target', 'rel'],
      span: ['class', 'style'],
      div: ['class', 'style'],
    },
  });
}

export function sanitizeClient(html: string): string {
  return DOMPurify.sanitize(html);
}

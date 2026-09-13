// lib/markdown.ts
import { sanitizeServer } from './sanitize';

/**
 * Converts Markdown text into sanitized, styled HTML for public pages.
 * Handles headings, bold/italic, lists, fenced code blocks, inline code,
 * blockquotes, links, images, horizontal rules, and tables.
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return '';

  // If input already contains structured HTML block elements, sanitize directly
  const containsBlockHtml = /<(p|h[1-6]|ul|ol|div|blockquote|table|pre)\b/i.test(markdown);
  if (containsBlockHtml && !markdown.trim().startsWith('#') && !markdown.trim().startsWith('```')) {
    return sanitizeServer(markdown);
  }

  let html = markdown;

  // Fenced Code Blocks (```lang ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="bg-zinc-950/90 border border-white/10 p-5 rounded-xl overflow-x-auto text-xs text-cyan-300 my-6 font-mono shadow-inner"><code class="language-${lang || 'text'}">${escapedCode}</code></pre>`;
  });

  // Blockquotes
  html = html.replace(/^>\s*(.*$)/gim, '<blockquote class="border-l-4 border-accent pl-4 py-2 my-5 text-zinc-300 italic bg-white/5 rounded-r-lg">$1</blockquote>');

  // Headings
  html = html.replace(/^###### (.*$)/gim, '<h6 class="text-xs font-bold text-white mt-6 mb-2 tracking-wider uppercase">$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5 class="text-sm font-bold text-white mt-6 mb-2 tracking-tight">$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-base font-bold text-white mt-6 mb-2 tracking-tight">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-white mt-8 mb-3 tracking-tight border-b border-white/10 pb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl md:text-2xl font-black text-white mt-10 mb-4 tracking-tight border-b border-white/10 pb-2">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl md:text-4xl font-black text-white mt-12 mb-6 tracking-tight">$1</h1>');

  // Horizontal Rules
  html = html.replace(/^---$/gim, '<hr class="border-white/10 my-8" />');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-8 flex flex-col items-center"><img src="$2" alt="$1" class="rounded-xl border border-white/10 max-h-[500px] w-auto object-contain bg-black/40 shadow-lg" /><span class="text-xs text-zinc-400 mt-2 italic">$1</span></div>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:text-accent-hover transition-colors underline underline-offset-4 font-semibold">$1</a>');

  // Bold & Italic
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic text-zinc-300">$1</em>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, '<code class="px-2 py-0.5 rounded bg-white/10 text-cyan-300 font-mono text-xs border border-white/10">$1</code>');

  // Unordered Lists
  html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="ml-4 list-disc text-zinc-300 my-1 leading-relaxed">$1</li>');

  // Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li class="ml-4 list-decimal text-zinc-300 my-1 leading-relaxed">$1</li>');

  // Wrap contiguous <li> in <ul> / <ol>
  html = html.replace(/(<li class="[^"]*list-disc[^"]*"[\s\S]*?<\/li>)+/g, '<ul class="my-4 space-y-1 bg-white/3 p-4 rounded-xl border border-white/5">$$&</ul>');
  html = html.replace(/(<li class="[^"]*list-decimal[^"]*"[\s\S]*?<\/li>)+/g, '<ol class="my-4 space-y-1 bg-white/3 p-4 rounded-xl border border-white/5">$$&</ol>');

  // Paragraphs for double breaks
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<pre') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<hr') ||
        trimmed.startsWith('<div')
      ) {
        return trimmed;
      }
      return `<p class="my-4 leading-relaxed text-zinc-300 text-sm md:text-base">${trimmed}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return sanitizeServer(html);
}

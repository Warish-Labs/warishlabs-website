import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://warishlabs.in';
  return {
    rules: [
      {
        // Default rule for all crawlers — allow public content
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      // Explicitly allow AI/agent crawlers for discoverability
      // WarishLabs opts in to AI indexing — products and blog content
      // are published for discovery by humans and AI tools alike.
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-Web', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Omgilibot', allow: '/' },
      { userAgent: 'FacebookBot', allow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://warishlabs.in';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'], // Block search indexing on admin consoles and backend API endpoints
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

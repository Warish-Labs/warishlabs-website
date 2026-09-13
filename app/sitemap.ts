import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://warishlabs.in';

  // Fetch dynamic entries — all catch errors gracefully
  const [products, blogs, categories] = await Promise.all([
    prisma.product.findMany({
      select: { slug: true, updatedAt: true },
    }).catch(() => []),

    prisma.blog.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }).catch(() => []),

    prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    }).catch(() => []),
  ]);

  const staticRoutes = [
    '',
    '/about',
    '/products',
    '/blog',
    '/categories',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map((p: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogRoutes = blogs.map((b: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const categoryRoutes = categories.map((c: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...blogRoutes,
    ...categoryRoutes,
  ];
}

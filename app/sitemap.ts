import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://warishlabs.in';
  
  // Fetch dynamic product and lab slug entries
  const products = await prisma.product.findMany({ 
    select: { slug: true, updatedAt: true } 
  }).catch(() => []);
  
  const labs = await prisma.lab.findMany({ 
    select: { slug: true, updatedAt: true } 
  }).catch(() => []);

  const blogs = await prisma.blog.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true }
  }).catch(() => []);

  const staticRoutes = ['', '/about', '/products', '/labs', '/blog', '/contact'].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const productRoutes = products.map(p => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const labRoutes = labs.map(l => ({
    url: `${baseUrl}/labs`, // Labs are displayed in lists, route mapping to labs page
    lastModified: l.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const blogRoutes = blogs.map(b => ({
    url: `${baseUrl}/blog/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...labRoutes, ...blogRoutes];
}

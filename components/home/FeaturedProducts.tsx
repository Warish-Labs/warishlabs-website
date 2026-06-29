import React from 'react';
import prisma from '@/lib/prisma';
import FeaturedProductsList from './FeaturedProductsList';

export default async function FeaturedProducts() {
  // Fetch products that are featured and should be shown on the homepage
  const products = await prisma.product.findMany({
    where: {
      status: 'active',
      featured: true,
      showOnHomepage: true,
    } as any,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      technologies: {
        include: {
          technology: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      displayOrder: 'asc',
    } as any,
  }).catch((err) => {
    console.error('[FeaturedProducts] Failed to fetch products:', err);
    return [];
  });

  if (products.length === 0) {
    return null;
  }

  // Map to matching props type
  const typedProducts = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    status: p.status,
    visitUrl: p.visitUrl,
    logoUrl: p.logoUrl,
    category: {
      name: p.category.name,
      slug: p.category.slug,
    },
    technologies: p.technologies.map((t: any) => ({
      technology: {
        id: t.technology.id,
        name: t.technology.name,
      },
    })),
  }));

  return (
    <section className="py-24 bg-bg-primary relative border-t border-border/40 select-none">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Featured Platforms
          </h2>
          <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
            Production software built to be reliable, fast, and satisfying to use.
          </p>
        </div>

        {/* Animated Cards Grid Component */}
        <FeaturedProductsList products={typedProducts} />
      </div>
    </section>
  );
}

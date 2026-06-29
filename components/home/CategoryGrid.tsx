import React from 'react';
import prisma from '@/lib/prisma';
import CategoryGridList from './CategoryGridList';

export default async function CategoryGrid() {
  // Query categories with the count of related products
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  }).catch((err) => {
    console.error('[CategoryGrid] Failed to fetch categories:', err);
    return [];
  });

  // Sort by product count descending and take up to 6
  const sortedCategories = categories
    .sort((a, b) => b._count.products - a._count.products)
    .slice(0, 6);

  if (sortedCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-bg-primary relative border-t border-border/40 select-none">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Browse by Category
          </h2>
          <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
            Explore our engineering efforts organized across specific technology landscapes.
          </p>
        </div>

        {/* Category Cards List */}
        <CategoryGridList categories={sortedCategories} />
      </div>
    </section>
  );
}

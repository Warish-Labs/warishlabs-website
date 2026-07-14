import React from 'react';
import prisma from '@/lib/prisma';
import CategoryGridList from './CategoryGridList';
import { FolderOpen } from 'lucide-react';

export default async function CategoryGrid() {
  // Query first 8 categories with the count of related products, ordered by createdAt
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { createdAt: 'asc' },
    take: 8,
  }).catch((err) => {
    console.error('[CategoryGrid] Failed to fetch categories:', err);
    return [];
  });

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-bg-primary relative border-t border-border/40 select-none">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
            <FolderOpen className="w-3.5 h-3.5" />
            LANDSCAPES
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Browse by Category
          </h2>
          <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
            Explore our engineering efforts organized across specific technology landscapes.
          </p>
        </div>

        {/* Category Cards List */}
        <CategoryGridList categories={categories} />
      </div>
    </section>
  );
}

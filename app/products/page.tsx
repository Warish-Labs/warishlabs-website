import React, { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductService } from '@/services/ProductService';
import ProductCatalog from '@/components/products/ProductCatalog';
import { Briefcase } from 'lucide-react';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export default async function ProductsPage() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();
  
  const [products, categories] = await Promise.all([
    ProductService.getAll(false).catch(() => []), // Fetch all including beta/archived
    prisma.category.findMany({
      orderBy: { name: 'asc' },
    }).catch(() => []),
  ]);

  // Format dates and relational fields to simple serializable objects for client
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    status: p.status,
    type: p.type,
    displayOrder: p.displayOrder,
    createdAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
    visitUrl: p.visitUrl,
    logoUrl: p.logoUrl,
    category: {
      name: p.category.name,
      slug: p.category.slug,
    },
  }));

  const serializedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-mesh-gradient blueprint-grid text-white pt-32 pb-24 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          {/* Page Header */}
          <div className="max-w-2xl space-y-4 mb-16 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Briefcase className="w-3.5 h-3.5" />
              PRODUCT CATALOG
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              All Products
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Browse all products built and maintained by WarishLabs — web tools, Android apps, and developer utilities.
            </p>
          </div>

          {/* Suspense catalog container */}
          <Suspense fallback={<div className="text-center py-20 text-text-secondary text-sm animate-pulse">Loading products...</div>}>
            <ProductCatalog initialProducts={serializedProducts} categories={serializedCategories} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Folder } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { cookies } from 'next/headers';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  await cookies();
  const { slug } = await params;

  // Query category by slug and include its active products
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: {
          status: { in: ['active', 'beta'] },
        },
        include: {
          category: true,
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
        orderBy: { displayOrder: 'asc' },
      },
    },
  }).catch(() => null);

  if (!category) {
    notFound();
  }

  // Format products for hydration compatibility
  const serializedProducts = category.products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    status: p.status,
    type: p.type,
    displayOrder: p.displayOrder,
    createdAt: p.createdAt.toISOString(),
    visitUrl: p.visitUrl,
    logoUrl: p.logoUrl,
    category: {
      name: category.name,
      slug: category.slug,
    },
    technologies: p.technologies.map((t) => ({
      technology: {
        id: t.technology.id,
        name: t.technology.name,
      },
    })),
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Categories
          </Link>

          {/* Page Header */}
          <div className="max-w-2xl space-y-4 mb-16 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Folder className="w-3.5 h-3.5" />
              LANDSCAPE INDEX
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {category.name}
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              {category.description || `Browse active systems constructed under the ${category.name} landscape.`}
            </p>
          </div>

          {serializedProducts.length === 0 ? (
            <div className="text-center py-20 border border-white/8 bg-white/4 backdrop-blur-sm rounded-xl">
              <p className="text-text-secondary text-sm">No products currently active in this landscape.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {serializedProducts.map((product) => (
                 <ProductCard key={product.id} product={product} />
               ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

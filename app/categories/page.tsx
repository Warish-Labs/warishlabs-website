import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder, ArrowRight } from 'lucide-react';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  await cookies();

  // Query categories along with the count of related products
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: 'asc' },
  }).catch(() => []);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-mesh-gradient blueprint-grid text-white pt-32 pb-24 relative select-none">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          {/* Section Header */}
          <div className="max-w-2xl space-y-4 mb-16 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Folder className="w-3.5 h-3.5 animate-pulse" />
              LIBRARIES
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Category Landscapes
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Explore the taxonomies of platforms, visual libraries, developer utilities, and distributed tools we construct.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20 border border-border bg-bg-secondary/40 backdrop-blur-sm rounded-xl">
              <p className="text-text-secondary text-sm">No categories defined in the database landscape.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`} className="block h-full">
                  <Card className="glass-panel border-border bg-bg-secondary p-6 h-full flex flex-col justify-between premium-card-transition cursor-pointer relative overflow-hidden group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center text-accent group-hover:bg-accent/20 group-hover:border-accent/30 transition-all duration-300">
                          <Folder className="w-4 h-4" />
                        </div>
                        <Badge className="bg-accent-subtle text-accent border-accent/10 font-bold text-[10px]">
                          {cat._count.products} {cat._count.products === 1 ? 'Product' : 'Products'}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-black tracking-tight text-white pt-2 group-hover:text-accent transition-colors duration-300">
                        {cat.name}
                      </CardTitle>
                      <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-3">
                        {cat.description || 'Explore platforms developed in this category.'}
                      </CardContent>
                    </div>
                    <div className="pt-6 flex justify-end text-[10px] uppercase font-bold tracking-widest text-text-tertiary group-hover:text-accent transition-colors duration-300">
                      Open Landscape <ArrowRight className="w-3.5 h-3.5 ml-1.5 inline transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

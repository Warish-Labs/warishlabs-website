import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
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
      <main className="flex-1 bg-mesh-gradient blueprint-grid text-white pt-32 pb-24 relative select-none overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[120px] -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative">
          {/* Section Header */}
          <div className="max-w-2xl space-y-4 mb-20 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-extrabold uppercase tracking-widest bg-accent-subtle/50 px-3 py-1 rounded-full border border-accent/10">
              <Folder className="w-3.5 h-3.5 animate-pulse text-accent" />
              LIBRARIES
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
              Category Landscapes
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed max-w-lg">
              Explore the taxonomies of platforms, visual libraries, developer utilities, and distributed tools we construct.
            </p>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-20 border border-border bg-bg-secondary/40 backdrop-blur-md rounded-2xl">
              <Folder className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary text-sm">No categories defined in the database landscape.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.slug}`} className="block h-full">
                  <Card className="glass-panel border-border bg-bg-secondary/80 p-7 h-full flex flex-col justify-between premium-card-transition cursor-pointer relative overflow-hidden group rounded-2xl">
                    {/* Interactive hover glow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-accent/0 via-accent/0 to-accent/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* Subtle scanning highlight line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-accent-subtle/50 border border-accent/15 flex items-center justify-center text-accent group-hover:bg-accent/25 group-hover:border-accent/40 transition-all duration-300">
                          <Folder className="w-4 h-4 text-accent" />
                        </div>
                        <Badge className="bg-accent/10 text-accent border border-accent/20 font-extrabold text-[10px] uppercase tracking-wider rounded-md">
                          {cat._count.products} {cat._count.products === 1 ? 'Product' : 'Products'}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl font-black tracking-tight text-white pt-2 group-hover:text-accent transition-colors duration-300">
                        {cat.name}
                      </CardTitle>
                      <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-3 font-medium">
                        {cat.description || 'Explore platforms developed in this category.'}
                      </CardContent>
                    </div>

                    <div className="pt-8 flex justify-end text-[10px] uppercase font-bold tracking-widest text-text-tertiary group-hover:text-accent transition-colors duration-300 items-center">
                      Open Landscape 
                      <ArrowRight className="w-3.5 h-3.5 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300 text-accent" />
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

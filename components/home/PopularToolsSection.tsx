import React from 'react';
import { ProductService } from '@/services/ProductService';
import PopularToolsList from './PopularToolsList';
import { Sparkles } from 'lucide-react';

export default async function PopularToolsSection() {
  const products = await ProductService.getPopularProducts(8).catch((err) => {
    console.error('[PopularToolsSection] Failed to fetch popular products:', err);
    return [];
  });

  if (products.length === 0) {
    return null;
  }

  // Format products for serializability/props
  const serializedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    status: p.status,
    type: p.type,
    visitUrl: p.visitUrl,
    logoUrl: p.logoUrl,
    category: {
      name: p.category.name,
      slug: p.category.slug,
    },
  }));

  return (
    <section className="py-24 bg-bg-primary relative border-t border-border/40 select-none">
      {/* Background glow decoration */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            POPULAR MODULES
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Popular & Recent Tools
          </h2>
          <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
            Most frequently visited and recently added software laboratory pipelines.
          </p>
        </div>

        {/* Animated Cards Grid Component */}
        <PopularToolsList products={serializedProducts} />
      </div>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import { ProductService } from '@/services/ProductService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';

export default async function FeaturedProducts() {
  // Fetch active products
  const products = await ProductService.getAll(true);

  if (products.length === 0) {
    return null;
  }

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

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <Card
              key={product.id}
              className="glass-panel border-border shadow-card premium-card-transition relative overflow-hidden flex flex-col min-h-[320px]"
            >
              {/* Product Info */}
              <CardHeader className="space-y-3 pt-8 pb-4">
                <div className="flex items-center justify-between">
                  {/* Status Badge */}
                  <Badge
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                      product.status === 'active'
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    )}
                  >
                    {product.status}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-black tracking-tight text-white">
                  {product.name}
                </CardTitle>
                <p className="text-text-secondary text-sm font-semibold leading-relaxed">
                  {product.tagline}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between pt-2 pb-8">
                {/* Description snippet */}
                <div 
                  className="text-text-tertiary text-xs leading-relaxed max-w-prose mb-6 line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />

                {/* Tech tags and action links */}
                <div className="space-y-6">
                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-2">
                    {product.technologies.map((t) => (
                      <span
                        key={t.technology.id}
                        className="px-2 py-1 bg-bg-secondary border border-border-subtle rounded text-[10px] font-semibold text-text-secondary uppercase tracking-wider"
                      >
                        {t.technology.name}
                      </span>
                    ))}
                  </div>

                  {/* Actions links */}
                  <div className="flex items-center gap-4 pt-2">
                    <Link
                      href={`/products/${product.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                    >
                      Learn Details <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {product.visitUrl && (
                      <a
                        href={product.visitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-text-tertiary hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Launch
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Inline class merger wrapper for server components
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductService } from '@/services/ProductService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink, Briefcase, Terminal } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function ProductsPage() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();
  
  const products = await ProductService.getAll(false); // Fetch all including beta/archived

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
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
              Engineering Console
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Explore the laboratory software pipeline. From internal distributed computing engines to WebGL visual sandboxes.
            </p>
          </div>

          {/* Grid list */}
          {products.length === 0 ? (
            <div className="text-center py-20 border border-border bg-bg-secondary rounded-xl flex flex-col items-center gap-4">
              <Terminal className="w-12 h-12 text-text-tertiary animate-pulse" />
              <p className="text-text-secondary text-sm">No products constructed in the database catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="glass-panel border-border shadow-card premium-card-transition relative overflow-hidden flex flex-col min-h-[320px]"
                >
                  <CardHeader className="space-y-3 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                      <Badge
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                          product.status === 'active'
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : product.status === 'beta'
                            ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            : "bg-text-tertiary/10 border-border text-text-secondary"
                        )}
                      >
                        {product.status}
                      </Badge>
                      {product.logoUrl && (
                        <div className="w-10 h-10 rounded border border-border bg-bg-card flex items-center justify-center p-1.5 overflow-hidden shadow-sm shrink-0">
                          <img src={product.logoUrl} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight text-white">
                      {product.name}
                    </CardTitle>
                    <p className="text-text-secondary text-sm font-semibold leading-relaxed">
                      {product.tagline}
                    </p>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between pt-2 pb-8">
                    <div
                      className="text-text-tertiary text-xs leading-relaxed max-w-prose mb-6 line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />

                    <div className="space-y-6">
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

                      <div className="flex items-center gap-4 pt-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                        >
                          Console Details <ArrowRight className="w-3.5 h-3.5" />
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
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

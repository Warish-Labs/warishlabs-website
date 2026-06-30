'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/utils/cn';
import { sanitizeClient } from '@/lib/sanitize-client';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: string;
  type: string;
  visitUrl: string | null;
  logoUrl?: string | null;
  category: {
    name: string;
    slug: string;
  };
  technologies: Array<{
    technology: {
      id: string;
      name: string;
    };
  }>;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const firstLetter = product.name.trim().charAt(0).toUpperCase() || 'W';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm shadow-card premium-card-transition relative overflow-hidden flex flex-col min-h-[320px] h-full hover:border-accent/40 transition-all duration-300"
      >
        {/* Glow corner decoration */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-accent/5 blur-xl pointer-events-none" />

        <CardHeader className="space-y-3 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <Badge
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border select-none pointer-events-none",
                  product.status === 'active'
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : product.status === 'beta'
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                )}
              >
                {product.status}
              </Badge>
              {/* Type Badge */}
              <Badge className="text-[10px] font-bold bg-white/5 border-white/5 text-zinc-400 select-none pointer-events-none">
                {product.type}
              </Badge>
            </div>
            {product.logoUrl ? (
              <div className="w-10 h-10 rounded border border-white/10 bg-black/40 flex items-center justify-center p-1.5 overflow-hidden shadow-sm shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.logoUrl} alt={`${product.name} Logo`} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded border border-white/10 bg-accent-subtle flex items-center justify-center font-bold text-accent shrink-0 select-none">
                {firstLetter}
              </div>
            )}
          </div>
          
          <CardTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
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
            dangerouslySetInnerHTML={{ __html: sanitizeClient(product.description) }}
          />

          <div className="space-y-6">
            {/* Tech tags */}
            <div className="flex flex-wrap gap-2">
              {product.technologies.map((t) => (
                <span
                  key={t.technology.id}
                  className="px-2 py-1 bg-black/40 border border-white/5 rounded text-[10px] font-semibold text-zinc-400 uppercase tracking-wider select-none"
                >
                  {t.technology.name}
                </span>
              ))}
            </div>

            {/* Action Links */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
              >
                Console details <ArrowRight className="w-3.5 h-3.5" />
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
    </motion.div>
  );
}

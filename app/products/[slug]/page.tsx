import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ProductService } from '@/services/ProductService';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ArrowLeft, ExternalLink, Cpu, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

import { Metadata } from 'next';

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await ProductService.getBySlug(slug);
  if (!product) return { title: 'Product Not Found' };
  
  return {
    title: product.seo?.title || `${product.name} | WarishLabs`,
    description: product.seo?.description || product.tagline,
    keywords: product.seo?.keywords ? product.seo.keywords.split(',').map(k => k.trim()) : undefined,
    openGraph: {
      title: product.name,
      description: product.tagline,
      type: 'website',
      url: `https://warishlabs.in/products/${slug}`,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Opt-out of static rendering for dynamic date queries
  const cookieJar = await cookies();

  const { slug } = await params;
  const product = await ProductService.getBySlug(slug);

  if (!product) {
    notFound();
  }

  // Track product view on the server using visitor cookie
  const visitorId = cookieJar.get('wl_visitor')?.value;
  if (visitorId) {
    await prisma.analyticsEvent.create({
      data: {
        visitorId,
        eventName: 'product_view',
        eventData: { slug },
        url: `/products/${slug}`,
      },
    }).catch(err => console.error('Failed to log product view event:', err));
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Ambient glow decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          {/* Back Action */}
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
          </Link>

          {/* Product Header */}
          <div className="space-y-4 mb-12">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-accent-subtle border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                {product.category.name}
              </Badge>
              <Badge className="bg-bg-secondary border-border text-text-secondary text-[10px] font-bold uppercase tracking-wider">
                {product.status}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {product.name}
            </h1>
            <p className="text-text-secondary text-lg max-w-3xl font-semibold">
              {product.tagline}
            </p>
          </div>

          {/* Grid Layout splits details and side specs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Main column - Details */}
            <div className="lg:col-span-8 space-y-12">
              <Card className="glass-panel border-border shadow-card overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                    <Info className="w-4 h-4 text-accent" /> Description & Specs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-4">
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                </CardContent>
              </Card>

              {/* Product FAQs */}
              {product.faqs.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white tracking-tight uppercase text-text-secondary">
                    Frequently Asked Questions
                  </h3>
                  <Accordion className="w-full space-y-2">
                    {product.faqs.map((faq, idx) => (
                      <AccordionItem
                        key={faq.id}
                        value={`faq-${idx}`}
                        className="glass-panel border border-border/40 rounded-lg px-4 overflow-hidden"
                      >
                        <AccordionTrigger className="text-sm font-semibold text-white hover:text-accent hover:no-underline py-4">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-text-secondary text-xs leading-relaxed pb-4">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}
            </div>

            {/* Right Sidebar - Actions & Tech Specs */}
            <div className="lg:col-span-4 space-y-6">
              {/* Launch & Repository buttons */}
              <Card className="glass-panel border-border shadow-card p-6 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Actions
                </h4>
                <div className="flex flex-col gap-3">
                  {product.visitUrl ? (
                    <a
                      href={product.visitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        buttonVariants({ variant: "default" }),
                        "w-full bg-accent hover:bg-accent-hover text-white py-5 font-semibold text-sm flex items-center justify-center gap-2"
                      )}
                    >
                      <ExternalLink className="w-4 h-4" /> Launch Platform
                    </a>
                  ) : (
                    <div className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full bg-bg-secondary border border-border text-text-tertiary py-5 font-semibold text-sm flex items-center justify-center opacity-50 cursor-not-allowed"
                    )}>
                      Visit Unavailable
                    </div>
                  )}
                </div>
              </Card>

              {/* Technologies details */}
              <Card className="glass-panel border-border shadow-card p-6 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-accent" /> Tech Stack
                </h4>
                <div className="flex flex-wrap gap-2 pt-2">
                  {product.technologies.map((t) => (
                    <span
                      key={t.technology.id}
                      className="px-2.5 py-1 bg-bg-secondary border border-border-subtle rounded text-xs font-semibold text-text-secondary uppercase tracking-wider"
                    >
                      {t.technology.name}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Metadata */}
              <Card className="glass-panel border-border shadow-card p-6 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                  Platform Info
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Category</span>
                    <span className="text-white font-semibold">{product.category.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Pipeline Stage</span>
                    <span className="text-white font-semibold capitalize">{product.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Constructed</span>
                    <span className="text-white font-semibold">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

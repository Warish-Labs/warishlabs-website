import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Category, Lab, Blog } from '@prisma/client';
import Link from 'next/link';
import ProductCard from '@/components/products/ProductCard';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Search, Briefcase, Folder, FlaskConical, FileText, ArrowRight, CornerDownRight } from 'lucide-react';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Opt out of static generation
  await cookies();
  const { q = '' } = await searchParams;
  const query = q.trim();

  let products: Array<{
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    status: string;
    type: string;
    displayOrder: number;
    createdAt: string;
    visitUrl: string | null;
    logoUrl: string | null;
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
  }> = [];
  let categories: Array<Category & { _count?: { products: number } }> = [];
  let labs: Lab[] = [];
  let blogs: Blog[] = [];

  if (query) {
    // Parallel database searches
    const [dbProducts, dbCategories, dbLabs, dbBlogs] = await Promise.all([
      // 1. Products
      prisma.product.findMany({
        where: {
          status: { in: ['active', 'beta'] },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { tagline: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
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
        take: 10,
      }).catch(() => []),

      // 2. Categories
      prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          _count: {
            select: { products: true },
          },
        },
        take: 5,
      }).catch(() => []),

      // 3. Labs Sandbox
      prisma.lab.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { techStack: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }).catch(() => []),

      // 4. Blogs
      prisma.blog.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }).catch(() => []),
    ]);

    // Format products for hydration compatibility
    products = dbProducts.map((p) => ({
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
        name: p.category.name,
        slug: p.category.slug,
      },
      technologies: p.technologies.map((t) => ({
        technology: {
          id: t.technology.id,
          name: t.technology.name,
        },
      })),
    }));

    categories = dbCategories;
    labs = dbLabs;
    blogs = dbBlogs;
  }

  const totalResults = products.length + categories.length + labs.length + blogs.length;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-mesh-gradient blueprint-grid text-white pt-32 pb-24 relative select-none">
        {/* Glow decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          {/* Section Header */}
          <div className="max-w-2xl space-y-4 mb-10 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Search className="w-3.5 h-3.5" />
              GLOBAL REGISTRY
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Search Console
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Query our relational directories for specialized SaaS products, classification categories, labs, or engineering publications.
            </p>
          </div>

          {/* Interactive Search Field Bar */}
          <div className="max-w-2xl mb-12">
            <form action="/search" method="GET" className="relative flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Enter specifications, tech stack tags, or keywords..."
                  required
                  className="w-full pl-12 pr-4 py-3 bg-bg-secondary border border-border text-white rounded-xl focus:border-accent outline-none text-sm font-medium shadow-elevated focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.97] transition-all cursor-pointer shadow-accent"
              >
                Query
              </button>
            </form>
          </div>

          {/* Search Query Summary */}
          {query && (
            <div className="mb-10 text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
              <CornerDownRight className="w-4 h-4 text-accent" />
              Found {totalResults} {totalResults === 1 ? 'Result' : 'Results'} for query &ldquo;<span className="text-white">{query}</span>&rdquo;
            </div>
          )}

          {/* Search Results Segmented Layout */}
          {!query ? (
            <div className="text-center py-20 border border-border bg-bg-secondary/40 backdrop-blur-sm rounded-xl flex flex-col items-center gap-4">
              <Search className="w-12 h-12 text-text-tertiary animate-pulse" />
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">Console Registry Idle</p>
                <p className="text-text-secondary text-xs max-w-xs mx-auto leading-relaxed">
                  Enter a keyword query above to search our software laboratory and blog indices.
                </p>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-20 border border-border bg-bg-secondary/40 backdrop-blur-sm rounded-xl flex flex-col items-center gap-4">
              <Search className="w-12 h-12 text-red-500/80" />
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">No Matches Resolved</p>
                <p className="text-text-secondary text-xs max-w-xs mx-auto leading-relaxed">
                  We couldn&apos;t resolve any records for &ldquo;<span className="text-white">{query}</span>&rdquo;. Try searching for &ldquo;platform&rdquo;, &ldquo;React&rdquo;, or &ldquo;development&rdquo;.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Products Section */}
              {products.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2 border-b border-border/40 pb-2">
                    <Briefcase className="w-4 h-4 text-accent" /> Matched Products ({products.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2 border-b border-border/40 pb-2">
                    <Folder className="w-4 h-4 text-accent" /> Classification Landscapes ({categories.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/categories/${cat.slug}`} className="block h-full">
                        <Card className="glass-panel border-border bg-bg-secondary p-5 h-full flex flex-col justify-between premium-card-transition cursor-pointer relative overflow-hidden group">
                          <div className="space-y-2">
                            <CardTitle className="text-base font-black tracking-tight text-white group-hover:text-accent transition-colors duration-300">
                              {cat.name}
                            </CardTitle>
                            <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-2">
                              {cat.description || 'Explore platforms in this category.'}
                            </CardContent>
                          </div>
                          <div className="pt-4 flex justify-end text-[10px] uppercase font-bold tracking-widest text-text-tertiary group-hover:text-accent transition-colors duration-300">
                            Open <ArrowRight className="w-3 h-3 ml-1.5 inline transform group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Labs Section */}
              {labs.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2 border-b border-border/40 pb-2">
                    <FlaskConical className="w-4 h-4 text-accent" /> Sandbox Experiments ({labs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {labs.map((lab) => (
                      <Link key={lab.id} href={`/labs`} className="block">
                        <Card className="glass-panel border-border bg-bg-secondary p-5 premium-card-transition cursor-pointer relative overflow-hidden group">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base font-black tracking-tight text-white group-hover:text-accent transition-colors duration-300">
                                {lab.name}
                              </CardTitle>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase">
                                {lab.type}
                              </span>
                            </div>
                            <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-2">
                              {lab.description}
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Blogs Section */}
              {blogs.length > 0 && (
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2 border-b border-border/40 pb-2">
                    <FileText className="w-4 h-4 text-accent" /> Engineering Publications ({blogs.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {blogs.map((blog) => (
                      <Link key={blog.id} href={`/blog/${blog.slug}`} className="block">
                        <Card className="glass-panel border-border bg-bg-secondary p-5 premium-card-transition cursor-pointer relative overflow-hidden group">
                          <div className="space-y-2">
                            <CardTitle className="text-base font-black tracking-tight text-white group-hover:text-accent transition-colors duration-300 line-clamp-1">
                              {blog.title}
                            </CardTitle>
                            <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-2">
                              {blog.excerpt}
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

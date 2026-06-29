import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BlogService } from '@/services/BlogService';
import BlogCatalog from '@/components/blog/BlogCatalog';
import { FileText } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function BlogPage() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  // Fetch all published posts
  const posts = await BlogService.getAll(true).catch(() => []);

  // Format date fields to string properties for hydration safety
  const serializedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    category: post.category,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow halo backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header */}
          <div className="max-w-2xl space-y-4 mb-16 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              ENGINEERING BULLETINS
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Technical Journal
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Bulletins detailing architectural research, workflow system designs, WebGL optimizations, and case studies constructed at WarishLabs.
            </p>
          </div>

          {/* Catalog grid */}
          <BlogCatalog initialPosts={serializedPosts} />
        </div>
      </main>
      <Footer />
    </>
  );
}

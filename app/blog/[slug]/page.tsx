import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BlogService } from '@/services/BlogService';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import NewsletterCTA from '@/components/shared/NewsletterCTA';
import DOMPurify from 'isomorphic-dompurify';
import { Metadata } from 'next';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await BlogService.getBySlug(slug);
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: post.seo?.title || `${post.title} | WarishLabs Journal`,
    description: post.excerpt,
    keywords: post.seo?.keywords ? post.seo.keywords.split(',').map(k => k.trim()) : ['engineering', 'software', 'technology'],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: `https://www.warishlabs.in/blog/${slug}`,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  const { slug } = await params;
  const post = await BlogService.getBySlug(slug);

  if (!post) {
    notFound();
  }

  // Calculate reading time: ~200 words per minute
  const textContent = post.content.replace(/<[^>]*>/g, '');
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Query related posts in the same category
  const relatedPosts = await prisma.blog.findMany({
    where: {
      published: true,
      category: post.category,
      id: { not: post.id },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  }).catch(() => []);

  // Format dates to ISO strings for related posts
  const serializedRelated = relatedPosts.map((rp) => ({
    id: rp.id,
    title: rp.title,
    slug: rp.slug,
    excerpt: rp.excerpt,
    coverImage: rp.coverImage,
    category: rp.category,
    publishedAt: rp.publishedAt ? rp.publishedAt.toISOString() : null,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          {/* Back Action */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
            </Link>
          </div>

          {/* Article Info */}
          <div className="space-y-4 mb-10 text-left">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="bg-accent-subtle border-accent/20 text-accent text-[10px] font-bold uppercase tracking-wider">
                {post.category}
              </Badge>
              <span className="text-xs text-text-tertiary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs text-text-tertiary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center gap-2 pt-2 border-b border-border/40 pb-6 text-xs text-text-secondary">
              <div className="w-6 h-6 rounded-full bg-accent-subtle border border-accent/15 flex items-center justify-center text-accent shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>Written by WarishLabs Engineering</span>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="w-full h-80 md:h-[420px] rounded-2xl overflow-hidden border border-white/10 select-none pointer-events-none">
              <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Body */}
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardContent className="pt-8 px-6 md:px-10 prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-4">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
            </CardContent>
          </Card>

          {/* Newsletter Subscribe CTA */}
          <NewsletterCTA />

          {/* Related Articles Section */}
          {serializedRelated.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-white/5">
              <h3 className="text-lg font-bold text-white tracking-tight uppercase">
                Related Bulletins
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {serializedRelated.map((related) => (
                  <Card key={related.id} className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col justify-between hover:border-accent/40 hover:scale-[1.02] transition-all duration-300">
                    <div className="space-y-2">
                      <div className="text-[9px] font-bold text-accent uppercase tracking-wider">{related.category}</div>
                      <h4 className="text-sm font-black text-white leading-snug line-clamp-2">{related.title}</h4>
                      <p className="text-text-secondary text-[11px] leading-relaxed line-clamp-2">{related.excerpt}</p>
                    </div>
                    <Link
                      href={`/blog/${related.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-accent hover:text-accent-hover transition-colors pt-4 mt-auto"
                    >
                      Read post <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

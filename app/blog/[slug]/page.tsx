import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BlogService } from '@/services/BlogService';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { cookies } from 'next/headers';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  const { slug } = await params;
  const post = await BlogService.getBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl">
          {/* Back Action */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-text-tertiary hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Journal
          </Link>

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

          {/* Article Body */}
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardContent className="pt-8 px-6 md:px-10 prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed space-y-4">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BlogService } from '@/services/BlogService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, FileText, ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { cookies } from 'next/headers';

export default async function BlogPage() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  const posts = await BlogService.getAll(true); // Fetch published only

  // Helper to color code blog categories
  const getCategoryBadgeClass = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('dev') || cat.includes('platform')) {
      return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
    if (cat.includes('ai') || cat.includes('machine')) {
      return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
    }
    if (cat.includes('case')) {
      return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    }
    return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow halo */}
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

          {/* List of articles */}
          {posts.length === 0 ? (
            <div className="text-center py-20 border border-border bg-bg-secondary rounded-xl flex flex-col items-center gap-4">
              <Terminal className="w-12 h-12 text-text-tertiary animate-pulse" />
              <p className="text-text-secondary text-sm">No journal entries written in the database catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="glass-panel border-border shadow-card premium-card-transition relative overflow-hidden flex flex-col min-h-[300px]"
                >
                  <CardHeader className="space-y-3 pt-6 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", getCategoryBadgeClass(post.category))}>
                        {post.category}
                      </Badge>
                      <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}
                      </span>
                    </div>
                    <CardTitle className="text-xl font-bold tracking-tight text-white hover:text-accent transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col justify-between pt-2 pb-6">
                    <p className="text-text-secondary text-xs leading-relaxed max-w-prose mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors mt-auto"
                    >
                      Read Post <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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

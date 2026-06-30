'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Search, SlidersHorizontal, RotateCcw, ArrowRight } from 'lucide-react';
import NewsletterCTA from '../shared/NewsletterCTA';
import { cn } from '@/utils/cn';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: string;
  publishedAt: string | null;
}

interface BlogCatalogProps {
  initialPosts: BlogPost[];
}

export default function BlogCatalog({ initialPosts }: BlogCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  // Get distinct list of categories dynamically
  const categories = useMemo(() => {
    const cats = new Set(initialPosts.map((p) => p.category).filter(Boolean));
    return Array.from(cats);
  }, [initialPosts]);

  // Filter logic (in-memory)
  const filteredPosts = useMemo(() => {
    let result = [...initialPosts];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [initialPosts, selectedCategory, searchQuery]);

  // Highlight featured post only if no search filters are active
  const isFiltering = searchQuery.trim() !== '' || selectedCategory !== 'all';
  const featuredPost = !isFiltering && filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = !isFiltering && filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts;

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
    <div className="space-y-12 select-none">
      {/* Search & Filter matrix bar */}
      <div className="glass-panel border border-white/10 bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Journal Matrix Controls</h3>
          </div>
          {isFiltering && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[10px] uppercase font-bold text-accent hover:text-accent-hover transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Matrix
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Text Search Input */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search specifications, logs, titles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-black/40 border-white/10 text-white rounded-lg focus-visible:ring-accent"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val || 'all')}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all">All Bulletins</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Featured Post Card (rendered only when not filtering) */}
      {featuredPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
        >
          <Link href={`/blog/${featuredPost.slug}`} className="block">
            <Card className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-accent/40 transition-all duration-350 cursor-pointer flex flex-col lg:flex-row min-h-[380px]">
              {featuredPost.coverImage && (
                <div className="lg:w-1/2 h-64 lg:h-auto overflow-hidden relative pointer-events-none select-none border-b lg:border-b-0 lg:border-r border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className={cn("p-8 md:p-12 flex-1 flex flex-col justify-between", !featuredPost.coverImage && "lg:w-full")}>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-accent tracking-widest uppercase">
                      ★ FEATURED BULLETIN
                    </span>
                    <span className="text-white/20">|</span>
                    <Badge className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border select-none pointer-events-none", getCategoryBadgeClass(featuredPost.category))}>
                      {featuredPost.category}
                    </Badge>
                  </div>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-prose line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-8 border-t border-white/5 flex items-center justify-between mt-8 text-xs">
                  {featuredPost.publishedAt && (
                    <span className="text-text-tertiary font-mono">
                      {new Date(featuredPost.publishedAt).toLocaleDateString(undefined, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 font-bold text-accent hover:text-accent-hover transition-colors">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Grid listing */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-24 border border-white/8 bg-white/4 backdrop-blur-sm rounded-xl flex flex-col items-center gap-4">
          <Terminal className="w-12 h-12 text-text-tertiary animate-pulse" />
          <p className="text-text-secondary text-sm">No engineering bulletins found matching matrix filters.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded bg-accent text-white text-xs font-bold uppercase hover:bg-accent-hover transition-colors"
          >
            Clear Matrix
          </button>
        </div>
      ) : (
        <>
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {regularPosts.map((post) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
                  className="h-full"
                >
                  <Card className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm shadow-card flex flex-col h-full hover:border-accent/40 transition-all duration-300 overflow-hidden">
                    {post.coverImage && (
                      <div className="w-full h-48 overflow-hidden relative border-b border-white/5 pointer-events-none select-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                          <Badge className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border select-none pointer-events-none", getCategoryBadgeClass(post.category))}>
                            {post.category}
                          </Badge>
                          {post.publishedAt && (
                            <span>
                              {new Date(post.publishedAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-lg font-black tracking-tight text-white leading-snug hover:text-accent transition-colors line-clamp-2">
                          <Link href={`/blog/${post.slug}`}>
                            {post.title}
                          </Link>
                        </CardTitle>
                        <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-3">
                          {post.excerpt}
                        </CardContent>
                      </div>

                      <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                        >
                          Read Post <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Newsletter Subscribe Banner */}
          <div className="pt-8">
            <NewsletterCTA />
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
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

interface LatestBlogPostsListProps {
  posts: BlogPost[];
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  },
};

export default function LatestBlogPostsList({ posts }: LatestBlogPostsListProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      {posts.map((post) => (
        <motion.div
          key={post.id}
          variants={cardVariants}
          whileHover={{ scale: 1.02 }}
          className="h-full"
        >
          <Card
            className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm shadow-card flex flex-col h-full hover:border-accent/40 transition-all duration-300 overflow-hidden"
          >
            {post.coverImage && (
              <div className="w-full h-48 overflow-hidden relative border-b border-white/5 select-none pointer-events-none">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="flex-1 flex flex-col justify-between p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
                  <Badge className="bg-white/10 text-zinc-300 border-white/5 font-semibold text-[9px] uppercase tracking-wider">
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
                <CardTitle className="text-lg font-black tracking-tight text-white leading-snug line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-3">
                  {post.excerpt}
                </CardContent>
              </div>

              <div className="pt-6 border-t border-white/5 mt-6">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                >
                  Read Article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

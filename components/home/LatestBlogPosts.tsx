import React from 'react';
import prisma from '@/lib/prisma';
import LatestBlogPostsList from './LatestBlogPostsList';

export default async function LatestBlogPosts() {
  // Query 3 most recent published blog posts
  const posts = await prisma.blog.findMany({
    where: {
      published: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 3,
  }).catch((err) => {
    console.error('[LatestBlogPosts] Failed to fetch blog posts:', err);
    return [];
  });

  if (posts.length === 0) {
    return null;
  }

  // Format dates to ISO strings for hydration safety
  const formattedPosts = posts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    category: post.category,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  return (
    <section className="py-24 bg-bg-primary relative border-t border-border/40 select-none">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Latest Bulletins
          </h2>
          <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
            Read our engineering case studies, architecture patterns, and product logs.
          </p>
        </div>

        {/* Latest Blog Cards */}
        <LatestBlogPostsList posts={formattedPosts} />
      </div>
    </section>
  );
}

import React from 'react';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoryGrid from '@/components/home/CategoryGrid';
import StatsSection from '@/components/home/StatsSection';
import LatestBlogPosts from '@/components/home/LatestBlogPosts';
import WhyWarishLabs from '@/components/home/WhyWarishLabs';
import FAQSection from '@/components/shared/FAQSection';
import Footer from '@/components/Footer';
import { cookies } from 'next/headers';

export default async function Home() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  // Fetch hero settings from database (seeded config)
  const heroSection = await prisma.homepageSection.findUnique({
    where: { sectionType: 'hero' },
  }).catch(() => null);

  const heroConfig = (heroSection?.config as {
    ctaPrimaryText?: string;
    ctaPrimaryUrl?: string;
    ctaSecondaryText?: string;
    ctaSecondaryUrl?: string;
    techFloating?: string[];
  }) || undefined;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WarishLabs',
    url: 'https://www.warishlabs.in',
    description: 'Engineering-first software laboratory constructing immersive 3D architectures, developer utilities, and resilient distributed platforms.',
    founder: { '@type': 'Person', name: 'MD Warish Ansari' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        {/* Dynamic Hero Section */}
        <HeroSection
          title={heroSection?.title || undefined}
          subtitle={heroSection?.subtitle || undefined}
          config={heroConfig}
        />
        
        {/* Featured Products Showcase */}
        <FeaturedProducts />

        {/* Categories Grid */}
        <CategoryGrid />

        {/* Live Statistics */}
        <StatsSection />

        {/* Latest Blog Bulletins */}
        <LatestBlogPosts />

        {/* Engineering Philosophy */}
        <WhyWarishLabs />

        {/* FAQ Section */}
        <div className="py-24 bg-bg-primary border-t border-border/40">
          <div className="container mx-auto px-6 max-w-7xl">
            <FAQSection showViewAll />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}



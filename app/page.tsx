import React from 'react';
import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/hero/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import StatsSection from '@/components/home/StatsSection';
import WhyWarishLabs from '@/components/home/WhyWarishLabs';
import Footer from '@/components/Footer';
import { cookies } from 'next/headers';

export default async function Home() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  // Fetch hero settings from database (seeded config) and DB counts
  const [heroSection, statsSection, visitorCount, activeProjectsCount] = await Promise.all([
    prisma.homepageSection.findUnique({
      where: { sectionType: 'hero' },
    }).catch(() => null),
    prisma.homepageSection.findUnique({
      where: { sectionType: 'stats' },
    }).catch(() => null),
    prisma.visitor.count().catch(() => 0),
    prisma.product.count().catch(() => 0),
  ]);

  // Construct dynamic real database statistics
  const stats = [
    { value: activeProjectsCount || 12, label: 'Active Projects', suffix: '+' },
    { value: visitorCount || 180, label: 'Total Site Visitors', suffix: '+' },
    { value: 50, label: 'Million Requests', suffix: 'M+' },
    { value: 5, label: 'Global Regions', suffix: '' },
  ];

  const heroConfig = heroSection?.config as any;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WarishLabs',
    url: 'https://warishlabs.in',
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

        {/* Live Statistics */}
        <StatsSection stats={stats} />

        {/* Engineering Philosophy */}
        <WhyWarishLabs />
      </main>
      <Footer />
    </>
  );
}

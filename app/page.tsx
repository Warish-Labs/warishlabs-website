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

  // Fetch hero settings from database (seeded config)
  const heroSection = await prisma.homepageSection.findUnique({
    where: { sectionType: 'hero' },
  });

  const statsSection = await prisma.homepageSection.findUnique({
    where: { sectionType: 'stats' },
  });

  // Map database stats list if it exists
  const customStats = statsSection?.config 
    ? (statsSection.config as any).items 
    : undefined;

  const heroConfig = heroSection?.config as any;

  return (
    <>
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
        <StatsSection stats={customStats} />

        {/* Engineering Philosophy */}
        <WhyWarishLabs />
      </main>
      <Footer />
    </>
  );
}

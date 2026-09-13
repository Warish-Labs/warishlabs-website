import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Terminal, Shield, Cpu, Code2, Globe, LucideIcon } from 'lucide-react';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

// Helper to resolve icon name dynamically
const iconMap: Record<string, LucideIcon> = {
  Shield: Shield,
  Cpu: Cpu,
  Globe: Globe,
  Code2: Code2,
};

export default async function AboutPage() {
  // Opt-out of static rendering to query DB dynamically
  await cookies();

  // Fetch CMS settings from the DB
  const aboutSection = await prisma.homepageSection.findUnique({
    where: { sectionType: 'about' },
  }).catch(() => null);

  // Set default values if not configured in CMS
  const defaultHighlights = [
    { title: 'Obsessive Quality', description: 'We believe that software should be built with absolute care, strict type contracts, and solid execution guarantees.', icon: 'Shield' },
    { title: 'Modern Stack', description: 'Next.js 16 App Router, Tailwind CSS, Prisma 7, PostgreSQL, Cloudinary, and React Three Fiber.', icon: 'Cpu' },
    { title: 'WebGL Systems', description: 'Interactive visual layers rendered using hardware-accelerated 3D graphics in the browser.', icon: 'Globe' },
    { title: 'Seeded CMS', description: 'Decoupled relational schema configuration that puts content control securely in the administrative console.', icon: 'Code2' },
  ];

  const defaultPhilosophy = [
    "We build software that people actually use — not demos or experiments. Every product WarishLabs ships is production-ready, maintained, and designed to solve a real problem for real users.",
    "Our engineering approach centers on strict type guarantees, relational data integrity, database-backed security, and highly optimized rendering pipelines. We believe software should feel fast, reliable, and honest."
  ];

  const title = aboutSection?.title || 'About WarishLabs';
  const subtitle = aboutSection?.subtitle || 'WarishLabs builds real, live software products — web and Android apps — that solve everyday problems, currently including Toolkit and ForgeFlow, each shipped at its own subdomain.';
  
  const config = (aboutSection?.config as Record<string, unknown>) || {};
  const philosophy = (config.philosophy as string[]) || defaultPhilosophy;
  const highlights = (config.highlights as Array<{ title: string; description: string; icon: string }>) || defaultHighlights;

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          {/* Header */}
          <div className="space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              ABOUT WARISHLABS
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              {title}
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Philosophy details */}
          <Card className="glass-panel border-border shadow-card p-6 md:p-10 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Our Philosophy</h2>
            <div className="text-text-secondary text-sm leading-relaxed space-y-4">
              {philosophy.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {highlights.map((item, idx) => {
              const isEmoji = /[\uD800-\uDFFF\u2600-\u27BF]/.test(item.icon) || item.icon.length <= 2;
              const IconComponent = !isEmoji ? (iconMap[item.icon] || Shield) : null;
              return (
                <Card key={idx} className="glass-panel border-border shadow-card p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent/10 flex items-center justify-center text-accent text-base select-none">
                    {isEmoji ? (
                      <span>{item.icon}</span>
                    ) : IconComponent ? (
                      <IconComponent className="w-5 h-5" />
                    ) : null}
                  </div>
                  <CardTitle className="text-base font-bold text-white tracking-tight">
                    {item.title}
                  </CardTitle>
                  <CardContent className="text-text-secondary text-xs leading-relaxed p-0">
                    {item.description}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

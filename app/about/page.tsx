import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Terminal, Shield, Cpu, Code2, Globe } from 'lucide-react';

export default function AboutPage() {
  const highlights = [
    { title: 'Obsessive Quality', description: 'We believe that software should be built with absolute care, strict type contracts, and solid execution guarantees.', icon: Shield },
    { title: 'Modern Stack', description: 'Next.js 15/16 App Router, Tailwind CSS v4, Prisma 7, PostgreSQL, Cloudinary, and React Three Fiber.', icon: Cpu },
    { title: 'WebGL Systems', description: 'Interactive visual layers rendered using hardware-accelerated 3D graphics in the browser.', icon: Globe },
    { title: 'Seeded CMS', description: 'Decoupled relational schema configuration that puts content control securely in the administrative console.', icon: Code2 },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl space-y-12">
          {/* Header */}
          <div className="space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-3.5 h-3.5" />
              LABORATORY PROFILE
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              About WarishLabs
            </h1>
            <p className="text-text-secondary text-base leading-relaxed">
              WarishLabs is a software engineering laboratory focused on building high-performance, beautiful, and highly stable developer tools and full-stack systems.
            </p>
          </div>

          {/* Philosophy details */}
          <Card className="glass-panel border-border shadow-card p-6 md:p-10 space-y-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Our Philosophy</h2>
            <div className="text-text-secondary text-sm leading-relaxed space-y-4">
              <p>
                We believe that modern web applications should feel like hardware. They should be responsive, tactile, and built with extreme restraint. We avoid flashy, decorative widgets that slow down load times or distract the user.
              </p>
              <p>
                Our architectural direction is centered around strict type guarantees, relational data integrity, database-backed security systems, and highly optimized edge rendering pipelines.
              </p>
            </div>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Card key={idx} className="glass-panel border-border shadow-card p-6 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent/10 flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
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

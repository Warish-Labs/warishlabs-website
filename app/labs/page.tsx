import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Terminal, ArrowRight } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function LabsPage() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  const labs = await prisma.lab.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Fallback mock labs for local development
  const displayLabs = labs.length > 0 ? labs : [
    {
      id: 'mock-1',
      name: 'R3F Physics Engine Mockup',
      slug: 'r3f-physics-engine',
      description: 'A sandbox testing browser-based physical particle interactions using React Three Fiber, Rapier, and customized canvas meshes.',
      url: null,
      githubUrl: null,
      status: 'active',
    },
    {
      id: 'mock-2',
      name: 'Upstash Rate-Limit Visualizer',
      slug: 'upstash-rate-limit-visualizer',
      description: 'Observe sliding window and token bucket rate limits visually in real-time, matching redis keys and IP client pools.',
      url: 'https://ratelimit.warishlabs.com',
      githubUrl: null,
      status: 'completed',
    }
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl">
          {/* Header */}
          <div className="max-w-2xl space-y-4 mb-16 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5" />
              EXPERIMENTAL SANDBOX
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Labs Sandbox
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed">
              Where we build prototypes, visual experiments, and explore architectural concepts before stabilizing them into platforms.
            </p>
          </div>

          {/* Grid listing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayLabs.map((lab) => (
              <Card
                key={lab.id}
                className="glass-panel border-border shadow-card premium-card-transition relative overflow-hidden flex flex-col min-h-[220px]"
              >
                <CardHeader className="space-y-2 pt-6 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                        lab.status === 'active'
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : lab.status === 'completed'
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-text-tertiary/10 border-border text-text-secondary"
                      )}
                    >
                      {lab.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-white">
                    {lab.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-text-secondary text-xs leading-relaxed flex-1 flex flex-col justify-between pt-2 pb-6">
                  <p className="mb-6">{lab.description}</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    {lab.url && (
                      <a
                        href={lab.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                      >
                        Launch Experiment <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

import React from 'react';
import { ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const pillars = [
  {
    title: 'Extreme Restraint',
    description: 'We prioritize performance and utility over visual decoration. Every animation serves the content. Every grid line establishes alignment.',
    icon: ShieldCheck,
  },
  {
    title: 'High-Velocity Execution',
    description: 'Constructed on Next.js 16 and Tailwind v4. Pages load in milliseconds. Operations feel immediate and responsive.',
    icon: Zap,
  },
  {
    title: 'Obsessive Architecture',
    description: 'Strict TypeScript compiler checks, database transactions, session revocation guarantees, and granular security policies.',
    icon: Layers,
  },
  {
    title: 'Immersive Physics',
    description: 'Integrating hardware-accelerated 3D WebGL components that respond physically to mouse gestures and interactive user flow.',
    icon: Sparkles,
  },
];

export default function WhyWarishLabs() {
  return (
    <section className="py-24 bg-bg-primary border-t border-border/40 select-none relative">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <div className="space-y-3 mb-16 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Engineering Principles
          </h2>
          <p className="text-text-secondary text-base max-w-2xl leading-relaxed">
            The core tenants guiding our software construction.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={idx}
                className="glass-panel border-border shadow-card premium-card-transition relative overflow-hidden flex flex-col p-4 min-h-[220px]"
              >
                <CardHeader className="space-y-3 pt-4 pb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent-subtle border border-accent/10 flex items-center justify-center text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg font-bold text-white tracking-tight">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-text-secondary text-xs leading-relaxed flex-1">
                  {pillar.description}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

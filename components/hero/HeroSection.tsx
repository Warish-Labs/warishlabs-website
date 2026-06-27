'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FADE_UP, STAGGER_CONTAINER, SPRING_DEFAULT } from '@/constants/motion';
import { buttonVariants } from '@/components/ui/button';
import HeroCanvas from './HeroCanvas';
import { ArrowRight, Code, Terminal, Shield } from 'lucide-react';
import { cn } from '@/utils/cn';

interface HeroProps {
  title?: string;
  subtitle?: string;
  config?: {
    ctaPrimaryText?: string;
    ctaPrimaryUrl?: string;
    ctaSecondaryText?: string;
    ctaSecondaryUrl?: string;
    techFloating?: string[];
  };
}

export default function HeroSection({ title, subtitle, config }: HeroProps) {
  const ctaPrimaryText = config?.ctaPrimaryText || 'Explore Products';
  const ctaPrimaryUrl = config?.ctaPrimaryUrl || '/products';
  const ctaSecondaryText = 'Learn More';
  const ctaSecondaryUrl = '/about';

  const stats = [
    { value: '12+', label: 'Products Shipped', icon: Code },
    { value: '99.9%', label: 'Systems Uptime', icon: Shield },
    { value: '100%', label: 'Typesafe Code', icon: Terminal },
  ];

  return (
    <section className="bg-mesh-gradient blueprint-grid min-h-[90vh] flex items-center justify-center pt-24 pb-16 relative overflow-hidden">
      {/* Glow halos */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent-glow/3 blur-3xl -z-10 pointer-events-none" />

      {/* Decorative scanline overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-5 opacity-20">
        <div className="scan-line" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content column */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="lg:col-span-7 space-y-8 text-left"
          >
            {/* Version Badge */}
            <motion.div variants={FADE_UP} transition={SPRING_DEFAULT}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-subtle border border-accent/20 text-xs font-semibold text-accent tracking-wide uppercase">
                <Terminal className="w-3.5 h-3.5" />
                CONSTRUCTING SYSTEM V2.0
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={FADE_UP}
              transition={SPRING_DEFAULT}
              className="text-4xl md:text-5xl lg:text-[54px] font-extrabold tracking-tight text-white leading-[1.05]"
            >
              {title || 'We Construct High-Velocity Systems'}
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={FADE_UP}
              transition={SPRING_DEFAULT}
              className="text-text-secondary text-base md:text-lg max-w-2xl leading-relaxed"
            >
              {subtitle || 'WarishLabs is an engineering-first software laboratory constructing immersive 3D architectures, developer utilities, and resilient distributed platforms.'}
            </motion.p>

            {/* Action CTAs */}
            <motion.div
              variants={FADE_UP}
              transition={SPRING_DEFAULT}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                href={ctaPrimaryUrl}
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  "bg-accent hover:bg-accent-hover text-white px-6 py-6 shadow-accent hover:shadow-accent-hover active:scale-[0.97] transition-all font-semibold rounded-lg text-sm flex items-center gap-2"
                )}
              >
                {ctaPrimaryText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href={ctaSecondaryUrl}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  "border-border hover:border-accent hover:bg-accent-subtle text-white px-6 py-6 active:scale-[0.97] transition-all font-semibold rounded-lg text-sm bg-bg-card flex items-center gap-2"
                )}
              >
                {ctaSecondaryText}
              </Link>
            </motion.div>

            {/* Simple Key Stats */}
            <motion.div
              variants={FADE_UP}
              transition={SPRING_DEFAULT}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-border/60"
            >
              {stats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      <StatIcon className="w-3.5 h-3.5 text-accent" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right 3D Visual column */}
          <div className="lg:col-span-5 h-[350px] lg:h-[480px] w-full relative">
            {/* 3D Canvas element - Hidden on mobile to prioritize loading and frame rates */}
            <div className="hidden md:block w-full h-full">
              <HeroCanvas />
            </div>

            {/* Mobile Visual Graphic Fallback */}
            <div className="md:hidden w-full h-full flex items-center justify-center">
              <div className="relative w-64 h-64 border border-border bg-bg-card rounded-2xl flex items-center justify-center glow-accent-element">
                <div className="absolute inset-2 border border-border-subtle rounded-xl flex items-center justify-center bg-black">
                  <span className="text-5xl font-black text-accent tracking-tighter">&lt;WL/&gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

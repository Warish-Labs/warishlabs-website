'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  const [statsData, setStatsData] = useState<{ products: number; visitors: number } | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          setStatsData({
            products: data.products,
            visitors: data.visitors,
          });
        }
      } catch (err) {
        console.error('Failed to fetch hero stats:', err);
      }
    }
    fetchStats();
  }, []);

  const stats = [
    { value: statsData ? (statsData.products > 0 ? `${statsData.products}+` : '—') : '—', label: 'Products Shipped', icon: Code },
    { value: statsData ? (statsData.visitors > 0 ? `${statsData.visitors}+` : '—') : '—', label: 'Total Site Visitors', icon: Terminal },
    { value: '99.9%', label: 'Systems Uptime', icon: Shield },
  ];

  // Staff-grade inline gradient vignette legibility styling
  const vignetteStyle = {
    background: `
      radial-gradient(ellipse 55% 70% at 30% 50%, rgba(2,11,26,0.78) 0%, transparent 100%),
      linear-gradient(to right, rgba(2,11,26,0.88) 0%, rgba(2,11,26,0.45) 45%, transparent 70%),
      linear-gradient(to top, rgba(2,11,26,0.75) 0%, transparent 40%),
      linear-gradient(to bottom, rgba(2,11,26,0.55) 0%, transparent 30%)
    `
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 bg-[#020b1a] overflow-hidden select-none">
      {/* 1. Full-Bleed 3D WebGL Canvas Layer */}
      <HeroCanvas key={pathname} />

      {/* 2. Gradient Vignette Overlay for Text Legibility */}
      <div 
        style={vignetteStyle}
        className="absolute inset-0 pointer-events-none z-10" 
      />

      {/* 3. Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-[0.04] bg-black">
        <div className="scan-line" />
      </div>

      <div className="container mx-auto px-6 max-w-7xl relative z-20 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Content column */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={STAGGER_CONTAINER}
            className="lg:col-span-7 space-y-8 text-left"
          >
            {/* Laboratory Badge */}
            <motion.div variants={FADE_UP} transition={SPRING_DEFAULT}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-xs font-semibold text-blue-400 tracking-wide uppercase">
                ◈ LABS · BUILD ACTIVE
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
                  "bg-blue-600 hover:bg-blue-500 text-white px-6 py-6 shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] active:scale-[0.97] transition-all font-semibold rounded-lg text-sm flex items-center gap-2"
                )}
              >
                {ctaPrimaryText}
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href={ctaSecondaryUrl}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  "border border-white/12 bg-white/4 backdrop-blur-sm hover:border-blue-500 hover:bg-blue-500/10 text-white px-6 py-6 active:scale-[0.97] transition-all font-semibold rounded-lg text-sm flex items-center gap-2"
                )}
              >
                {ctaSecondaryText}
              </Link>
            </motion.div>

            {/* Key Stats */}
            <motion.div
              variants={FADE_UP}
              transition={SPRING_DEFAULT}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-white/8"
            >
              {stats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      <StatIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">{stat.label}</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                  </div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Floating Console Info Cards (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 justify-end items-end h-[480px]">
            {/* Status Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="glass-panel border border-white/8 bg-white/4 backdrop-blur-md p-4 rounded-xl shadow-card flex items-center gap-4 w-72 hover:border-blue-500/30 transition-all duration-200"
            >
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">All Systems Operational</p>
                <p className="text-[10px] text-text-secondary">WarishLabs Nodes Online & Verifying</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


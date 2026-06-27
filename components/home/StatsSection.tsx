'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';
import { FADE_UP, STAGGER_CONTAINER, SPRING_DEFAULT } from '@/constants/motion';
import { formatCompactNumber } from '@/utils/formatters';

interface StatItem {
  value: number;
  label: string;
  suffix?: string;
}

const defaultStats: StatItem[] = [
  { value: 12, label: 'Active Projects', suffix: '+' },
  { value: 1800, label: 'Star Rating', suffix: '+' },
  { value: 50000000, label: 'Million Requests', suffix: '' },
  { value: 5, label: 'Global Regions', suffix: '' },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
  const nodeRef = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(nodeRef, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate(value) {
        setDisplayValue(formatCompactNumber(Math.floor(value)));
      },
    });

    return () => controls.stop();
  }, [value, isInView]);

  return (
    <p ref={nodeRef} className="text-4xl md:text-5xl font-black text-white tracking-tight">
      {displayValue}{suffix}
    </p>
  );
}

export default function StatsSection({ stats = defaultStats }: { stats?: StatItem[] }) {
  return (
    <section className="py-24 bg-bg-secondary border-t border-border/40 select-none relative overflow-hidden">
      {/* Decorative Blueprint grid backdrop */}
      <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={FADE_UP}
              transition={SPRING_DEFAULT}
              className="space-y-2 p-6 bg-bg-card/30 border border-border/30 rounded-xl glass-panel text-center lg:text-left"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-text-tertiary">
                {stat.label}
              </h4>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

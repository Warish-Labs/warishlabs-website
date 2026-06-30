'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Folder } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    products: number;
  };
}

interface CategoryGridListProps {
  categories: Category[];
}

const containerVariants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
  },
};

export default function CategoryGridList({ categories }: CategoryGridListProps) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {categories.map((cat) => (
        <motion.div
          key={cat.id}
          variants={itemVariants}
          whileHover={{ scale: 1.03 }}
          className="h-full"
        >
          <Link href={`/products?category=${cat.slug}`} className="block h-full">
            <Card
              className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm shadow-card p-6 h-full flex flex-col justify-between hover:border-accent/40 transition-all duration-350 cursor-pointer"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center text-accent">
                    <Folder className="w-4 h-4" />
                  </div>
                  <Badge className="bg-accent-subtle text-accent border-accent/10 font-bold text-[10px]">
                    {cat._count.products} {cat._count.products === 1 ? 'Product' : 'Products'}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-black tracking-tight text-white pt-2">
                  {cat.name}
                </CardTitle>
                <CardContent className="text-text-secondary text-xs leading-relaxed p-0 line-clamp-2">
                  {cat.description || 'Explore platforms developed in this category.'}
                </CardContent>
              </div>
              <div className="pt-4 flex justify-end text-[10px] uppercase font-bold tracking-widest text-accent hover:text-accent-hover transition-colors">
                Browse Category →
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}

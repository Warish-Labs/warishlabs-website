'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import ProductCard from '../products/ProductCard';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: string;
  type: string;
  visitUrl: string | null;
  logoUrl?: string | null;
  category: {
    name: string;
    slug: string;
  };
}

interface PopularToolsListProps {
  products: Product[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

export default function PopularToolsList({ products }: PopularToolsListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}

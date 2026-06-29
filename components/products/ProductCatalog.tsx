'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';


interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: string;
  type: string;
  displayOrder: number;
  createdAt: string;
  visitUrl: string | null;
  logoUrl?: string | null;
  category: {
    name: string;
    slug: string;
  };
  technologies: Array<{
    technology: {
      id: string;
      name: string;
    };
  }>;
}

interface ProductCatalogProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ProductCatalog({ initialProducts, categories }: ProductCatalogProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL-driven initial states
  const categoryParam = searchParams.get('category') || 'all';
  const statusParam = searchParams.get('status') || 'all';
  const typeParam = searchParams.get('type') || 'all';
  const sortParam = searchParams.get('sort') || 'default';
  const searchParam = searchParams.get('search') || searchParams.get('q') || '';

  // Local filter states
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedStatus, setSelectedStatus] = useState(statusParam);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [sortBy, setSortBy] = useState(sortParam);

  // Sync state if URL search parameters change
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
    setSelectedStatus(searchParams.get('status') || 'all');
    setSelectedType(searchParams.get('type') || 'all');
    setSortBy(searchParams.get('sort') || 'default');
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Update URL search parameters
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === 'all' || val === 'default' || !val) {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Normalize search query parameter key to 'search'
    if ('search' in updates || 'q' in updates) {
      const val = updates.search || updates.q;
      params.delete('q');
      if (val) {
        params.set('search', val);
      } else {
        params.delete('search');
      }
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedType('all');
    setSortBy('default');
    router.push('/products');
  };

  // Get distinct list of product types dynamically
  const productTypes = useMemo(() => {
    const types = new Set(initialProducts.map((p) => p.type).filter(Boolean));
    return Array.from(types);
  }, [initialProducts]);

  // Filter & sort logic (in-memory)
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    // Filter by status (exclude archived by default, unless explicitly requested)
    if (selectedStatus === 'all') {
      result = result.filter((p) => p.status !== 'archived');
    } else {
      result = result.filter((p) => p.status === selectedStatus);
    }

    // Filter by category slug
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category.slug === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((p) => p.type === selectedType);
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.technologies.some((t) => t.technology.name.toLowerCase().includes(q))
      );
    }

    // Sort options
    if (sortBy === 'default') {
      result.sort((a, b) => a.displayOrder - b.displayOrder);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [initialProducts, selectedCategory, selectedStatus, selectedType, searchQuery, sortBy]);

  return (
    <div className="space-y-10">
      {/* Interactive Filter Panel Console */}
      <div className="glass-panel border border-white/10 bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Sort & Filter Options</h3>
          </div>
          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedType !== 'all' || sortBy !== 'default') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-[10px] uppercase font-bold text-accent hover:text-accent-hover transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Text Search Input */}
          <div className="md:col-span-4 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Search Specifications</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search specifications, stacks, names..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  updateParams({ search: e.target.value });
                }}
                className="pl-9 bg-black/40 border-white/10 text-white rounded-lg focus-visible:ring-accent"
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Category</span>
            <Select
              value={selectedCategory}
              onValueChange={(val) => {
                setSelectedCategory(val || 'all');
                updateParams({ category: val || 'all' });
              }}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg w-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Status</span>
            <Select
              value={selectedStatus}
              onValueChange={(val) => {
                setSelectedStatus(val || 'all');
                updateParams({ status: val || 'all' });
              }}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all">Active & Beta</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="beta">Beta only</SelectItem>
                <SelectItem value="archived">Archived only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Type</span>
            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val || 'all');
                updateParams({ type: val || 'all' });
              }}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg w-full">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all">All Types</SelectItem>
                {productTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Sort Order</span>
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val || 'default');
                updateParams({ sort: val || 'default' });
              }}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="default">Default Order</SelectItem>
                <SelectItem value="newest">Newly Created</SelectItem>
                <SelectItem value="alpha">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-24 border border-white/8 bg-white/4 backdrop-blur-sm rounded-xl flex flex-col items-center gap-4">
          <Terminal className="w-12 h-12 text-text-tertiary animate-pulse" />
          <p className="text-text-secondary text-sm">No products found matching filters.</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded bg-accent text-white text-xs font-bold uppercase hover:bg-accent-hover transition-colors"
          >
            Clear Filter Grid
          </button>
        </div>
      ) : (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

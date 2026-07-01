'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LabCard from './LabCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Terminal, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface Lab {
  id: string;
  name: string;
  slug: string;
  description: string;
  url: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  mediaUrl: string | null;
  status: string;
  type: string;
  techStack: string | null;
}

interface LabCatalogProps {
  initialLabs: Lab[];
}

export default function LabCatalog({ initialLabs }: LabCatalogProps) {
  const [searchVal, setSearchVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Debounce search query changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchVal);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const handleResetFilters = () => {
    setSearchVal('');
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedType('all');
  };

  // Get distinct list of lab types dynamically
  const labTypes = useMemo(() => {
    const types = new Set(initialLabs.map((l) => l.type).filter(Boolean));
    return Array.from(types);
  }, [initialLabs]);

  // Filter logic (in-memory)
  const filteredLabs = useMemo(() => {
    let result = [...initialLabs];

    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter((l) => l.status === selectedStatus);
    }

    // Filter by type
    if (selectedType !== 'all') {
      result = result.filter((l) => l.type === selectedType);
    }

    // Filter by text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          (l.techStack && l.techStack.toLowerCase().includes(q))
      );
    }

    return result;
  }, [initialLabs, selectedStatus, selectedType, searchQuery]);

  return (
    <div className="space-y-10">
      {/* Filters */}
      <div className="glass-panel border border-white/10 bg-white/5 backdrop-blur-md p-6 rounded-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/8 pb-4">
          <div className="flex items-center gap-2 text-white">
            <SlidersHorizontal className="w-4 h-4 text-accent" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Sandbox Filter Matrix</h3>
          </div>
          {(searchVal || selectedStatus !== 'all' || selectedType !== 'all') && (
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
          <div className="md:col-span-6 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Search Sandbox</span>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search experiments, libraries, concepts..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="pl-9 bg-black/40 border-white/10 text-white rounded-lg focus-visible:ring-accent"
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Status</span>
            <Select value={selectedStatus} onValueChange={(val) => setSelectedStatus(val || 'all')}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Prototype</SelectItem>
                <SelectItem value="completed">Completed Experiment</SelectItem>
                <SelectItem value="deprecated">Deprecated Sandbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Type Dropdown */}
          <div className="md:col-span-3 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block">Type</span>
            <Select value={selectedType} onValueChange={(val) => setSelectedType(val || 'all')}>
              <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-lg">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-white/10 text-white">
                <SelectItem value="all">All Types</SelectItem>
                {labTypes.map((type) => (
                  <SelectItem key={type} value={type} className="capitalize">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid listing */}
      {filteredLabs.length === 0 ? (
        <div className="text-center py-24 border border-white/8 bg-white/4 backdrop-blur-sm rounded-xl flex flex-col items-center gap-4">
          <Terminal className="w-12 h-12 text-text-tertiary animate-pulse" />
          <p className="text-text-secondary text-sm">No sandbox experiments found matching filters.</p>
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
            {filteredLabs.map((lab) => (
              <motion.div
                key={lab.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring' as const, stiffness: 100, damping: 15 }}
              >
                <LabCard lab={lab} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

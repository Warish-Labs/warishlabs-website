'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Play, ExternalLink } from 'lucide-react';
import Github from '@/components/icons/GithubIcon';
import { cn } from '@/utils/cn';

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

interface LabCardProps {
  lab: Lab;
}

export default function LabCard({ lab }: LabCardProps) {
  // Parse tech stack comma separated string to tags array
  const tags = lab.techStack
    ? lab.techStack.split(',').map((tag) => tag.trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card
        className="glass-panel border border-white/10 bg-white/5 backdrop-blur-sm shadow-card premium-card-transition relative overflow-hidden flex flex-col h-full hover:border-accent/40 transition-all duration-300"
      >
        {/* Screenshot Banner / Ambient Graphic Placeholder */}
        {lab.mediaUrl ? (
          <div className="w-full h-44 overflow-hidden relative border-b border-white/5 select-none pointer-events-none">
            <img src={lab.mediaUrl} alt={lab.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-24 bg-gradient-to-br from-accent/5 via-blue-900/10 to-transparent border-b border-white/5 flex items-center justify-center relative select-none pointer-events-none">
            <div className="absolute inset-0 blueprint-grid opacity-[0.03]" />
            <span className="text-[10px] font-mono tracking-widest text-accent-subtle/50 uppercase">
              // EXPERIMENTAL_WORKSPACE
            </span>
          </div>
        )}

        <CardHeader className="space-y-3 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Status Badge */}
              <Badge
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border select-none pointer-events-none",
                  lab.status === 'active'
                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    : lab.status === 'completed'
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                    : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                )}
              >
                {lab.status}
              </Badge>
              {/* Type Badge */}
              <Badge className="text-[10px] font-bold bg-white/5 border-white/5 text-zinc-400 select-none pointer-events-none capitalize">
                {lab.type}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-xl font-black tracking-tight text-white flex items-center gap-2 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            {lab.name}
          </CardTitle>
        </CardHeader>

        <CardContent className="text-text-secondary text-xs leading-relaxed flex-1 flex flex-col justify-between pt-2 pb-6">
          <p className="mb-6 line-clamp-3">{lab.description}</p>
          
          <div className="space-y-4">
            {/* Tech stack tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-black/40 border border-white/5 rounded text-[9px] font-semibold text-zinc-400 uppercase tracking-wider select-none"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/5">
              {lab.url && (
                <a
                  href={lab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                >
                  Launch Lab <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {lab.githubUrl && (
                <a
                  href={lab.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-tertiary hover:text-white transition-colors"
                >
                  <Github className="w-3.5 h-3.5" /> Repository
                </a>
              )}

              {lab.demoUrl && (
                <a
                  href={lab.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-text-tertiary hover:text-white transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Demo Video
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

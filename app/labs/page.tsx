import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import LabCatalog from '@/components/labs/LabCatalog';
import { FlaskConical } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function LabsPage() {
  // Opt-out of static rendering for dynamic date queries
  await cookies();

  interface SerializedLab {
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

  const labs = await prisma.lab.findMany({
    orderBy: { createdAt: 'desc' },
  }).catch(() => []);

  // Format database labs or use mock fallback labs
  const serializedLabs: SerializedLab[] = labs.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    description: l.description,
    url: l.url,
    githubUrl: l.githubUrl,
    demoUrl: l.demoUrl,
    mediaUrl: l.mediaUrl,
    status: l.status,
    type: l.type,
    techStack: l.techStack,
  })) 

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

          {/* Interactive catalog grid */}
          <LabCatalog initialLabs={serializedLabs} />
        </div>
      </main>
      <Footer />
    </>
  );
}

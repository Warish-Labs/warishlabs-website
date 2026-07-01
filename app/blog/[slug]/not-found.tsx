import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function BlogNotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative flex flex-col items-center justify-center min-h-[70vh] select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/5 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center mx-auto text-accent mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase">
            Bulletin Not Found
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-sm mx-auto">
            The engineering publication or journal entry you requested does not exist or has been removed.
          </p>
          <div className="pt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider active:scale-[0.97] transition-all cursor-pointer shadow-accent"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Journal
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

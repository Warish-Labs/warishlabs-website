import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HelpCircle, Clock, FileText } from 'lucide-react';

export const metadata = {
  title: 'Disclaimer',
  description: 'Legal disclaimer for WarishLabs products and website services.',
};

export default function DisclaimerPage() {
  const lastUpdated = 'June 29, 2026';

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-mesh-gradient blueprint-grid text-white pt-32 pb-24 relative select-none">
        {/* Ambient background decoration */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl">
          {/* Page Header */}
          <div className="max-w-2xl space-y-4 mb-12 text-left">
            <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5" />
              LEGAL NOTICE
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Disclaimer
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Last updated: {lastUpdated}
            </p>
          </div>

          {/* Disclaimer Document Body */}
          <div className="glass-panel border-border bg-bg-secondary/60 backdrop-blur-md rounded-2xl p-8 md:p-10 space-y-8 text-xs md:text-sm text-text-secondary leading-relaxed select-text">
            
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 1. Professional Portfolio Nature
              </h2>
              <p>
                WarishLabs is an engineering portfolio, content publication site, and software laboratory operated by MD Warish Ansari. The products listed (e.g. WarishLabs Cloud, Antigravity Engine) may range from active SaaS tools to conceptual engineering projects, beta-stage developer frameworks, or open-source prototypes. 
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 2. Educational and Sandbox Content
              </h2>
              <p>
                The sandbox environments, 3D interactive canvases (Three.js/R3F), and source code repositories linked on the Site are provided primarily for demonstration, testing, and educational purposes. We do not guarantee that sandbox code blocks or public packages are free from defects, secure, or suitable for any commercial application.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 3. No Warranties or Guarantees
              </h2>
              <p>
                All information and code on the Site is provided &ldquo;as-is&rdquo; with no guarantees of completeness, accuracy, timeliness, or results obtained from using this information. We do not warrant that the Site will remain secure, uninterrupted, or free from server crashes, database pool limitations, or transient downtime.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 4. External Links Disclaimer
              </h2>
              <p>
                The Site may contain links to external web resources, databases, or social platforms (e.g. GitHub repos, Cloudinary media galleries, Clerk authentication pages) that are not operated or controlled by us. We do not assume responsibility for the availability, cookie policies, or content of these external locations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 5. Limitation of Liability
              </h2>
              <p>
                Under no circumstances shall WarishLabs or MD Warish Ansari be liable to you or any third party for any decisions made or actions taken in reliance on the information on this Site, or for any consequential, special, or similar damages, even if advised of the possibility of such damages.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

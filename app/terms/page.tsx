import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShieldAlert, Clock, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Terms and conditions governing the use of WarishLabs website and services.',
};

export default function TermsConditionsPage() {
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
              <ShieldAlert className="w-3.5 h-3.5" />
              LEGAL TERMS
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Terms & Conditions
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Last updated: {lastUpdated}
            </p>
          </div>

          {/* Terms Document Body */}
          <div className="glass-panel border-border bg-bg-secondary/60 backdrop-blur-md rounded-2xl p-8 md:p-10 space-y-8 text-xs md:text-sm text-text-secondary leading-relaxed select-text">
            
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 1. Agreement to Terms
              </h2>
              <p>
                By accessing or using our website located at{' '}
                <a href="https://warishlabs.in" className="text-accent hover:underline font-mono">https://warishlabs.in</a>{' '}
                (the &ldquo;Site&rdquo;) or any services provided by WarishLabs, you agree to be bound by these Terms & Conditions. If you do not agree to all of these terms, do not access or use the Site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 2. Intellectually Property & Content License
              </h2>
              <p>
                Unless otherwise indicated, the Site, its code (including WebGL configurations, Three.js shaders, custom component logic), brand names, logos, databases, articles, and product catalogs are the property of WarishLabs and MD Warish Ansari. They are protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You are granted a limited, non-exclusive, non-transferable license to access the Site for informational and evaluation purposes. You may not distribute, scrape, re-host, copy, or commercialize any proprietary assets without our explicit written permission.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 3. Prohibited User Activities
              </h2>
              <p>
                As a user of the Site, you agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Submit spam messages, fake newsletter subscriptions, or execute script automated actions that bypass security filters.</li>
                <li>Bypass, disable, or tamper with security-focused rate limit boundaries (Redis cached rate limit thresholds).</li>
                <li>Attempt to gain unauthorized access to administrative endpoints (`/api/admin/*`) or modify system variables.</li>
                <li>Transmit malicious files, cross-site scripting (XSS) payloads, or execute denial of service attacks against our servers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 4. Disclaimer of Warranties
              </h2>
              <p>
                The Site and its contents are provided on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis. We make no warranties, representations, or guarantees, express or implied, regarding the operation of the Site, the accuracy of its product taglines, or the availability of the sandbox labs. To the fullest extent permitted by law, we disclaim all warranties of merchantability and fitness for a particular purpose.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 5. Limitation of Liability
              </h2>
              <p>
                In no event shall WarishLabs, MD Warish Ansari, or our service providers be liable for any direct, indirect, special, incidental, or consequential damages (including loss of profits, data corruption, or system interruptions) arising out of or in connection with your use or inability to use the Site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 6. Terminations & Account Revocations
              </h2>
              <p>
                We reserve the right, without notice and in our sole discretion, to terminate your access to the Site or block future access (including blocking IP pools or revoking Clerk SSO authentication sessions) if you violate these terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 7. Governing Law and Jurisdiction
              </h2>
              <p>
                These Terms & Conditions shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles. Any dispute arising under these terms shall be subject to the exclusive jurisdiction of the courts located in New Delhi, India.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 8. Changes to Terms
              </h2>
              <p>
                We reserve the right to revise and update these terms at any time. All updates are effective immediately upon posting. Your continued use of the Site following any changes indicates your acceptance of the revised terms.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

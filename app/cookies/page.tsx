import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eye, Clock, FileText } from 'lucide-react';

export const metadata = {
  title: 'Cookie Policy',
  description: 'Detailed information about how cookies are used on the WarishLabs website.',
};

export default function CookiePolicyPage() {
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
              <Eye className="w-3.5 h-3.5" />
              USER COOKIES
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Cookie Policy
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Last updated: {lastUpdated}
            </p>
          </div>

          {/* Cookie Document Body */}
          <div className="glass-panel border-border bg-bg-secondary/60 backdrop-blur-md rounded-2xl p-8 md:p-10 space-y-8 text-xs md:text-sm text-text-secondary leading-relaxed select-text">
            
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 1. What are Cookies?
              </h2>
              <p>
                Cookies are small text files placed on your computer or mobile device by websites that you visit. They are widely used to make websites work, improve navigation speed, and provide anonymous traffic information to the operators.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 2. How We Use Cookies
              </h2>
              <p>
                We use cookies to secure administrative sessions, prevent form submission spam, block brute force requests, and understand which laboratory projects receive visitor engagement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 3. Types of Cookies Set
              </h2>
              <p>
                The cookies set during your session are divided into the following categories:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse border border-border mt-3 text-[11px] md:text-xs">
                  <thead>
                    <tr className="bg-bg-primary text-white border-b border-border">
                      <th className="p-3 border-r border-border font-bold">Cookie Name / Provider</th>
                      <th className="p-3 border-r border-border font-bold">Category</th>
                      <th className="p-3 font-bold">Purpose & Retention</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border hover:bg-white/2">
                      <td className="p-3 border-r border-border font-mono text-white">__session, __client_uat (Clerk)</td>
                      <td className="p-3 border-r border-border text-white">Essential / Auth</td>
                      <td className="p-3">Maintains administrative dashboard sessions. Expires after session close.</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-white/2">
                      <td className="p-3 border-r border-border font-mono text-white">warishlabs_visitor_id (WarishLabs)</td>
                      <td className="p-3 border-r border-border text-white">Persistent Analytics</td>
                      <td className="p-3">Anonymous UUID cookie used to count total site visitors. Retained for 1 year.</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-white/2">
                      <td className="p-3 border-r border-border font-mono text-white">_ga, _gid (Google Analytics)</td>
                      <td className="p-3 border-r border-border text-white">Traffic Measurement</td>
                      <td className="p-3">Anonymously tracks visitor navigation and refers. Retained up to 2 years.</td>
                    </tr>
                    <tr className="hover:bg-white/2">
                      <td className="p-3 border-r border-border font-mono text-white">cf_clearance (Cloudflare Turnstile)</td>
                      <td className="p-3 border-r border-border text-white">Essential / Security</td>
                      <td className="p-3">Ensures requests are from actual humans, bypassing rate limits. Retained for 1 year.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 4. Controlling and Deleting Cookies
              </h2>
              <p>
                You can choose to reject or block cookies set by this Site or third-party providers. Most web browsers allow you to modify cookie preferences through browser settings.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>To clear existing cookies, search for &ldquo;Clear browsing data&rdquo; in your browser settings and select cookies.</li>
                <li>To restrict cookies, configure your browser settings to &ldquo;Block all cookies&rdquo; or &ldquo;Block third-party cookies.&rdquo;</li>
              </ul>
              <p className="text-amber-400 font-semibold text-xs">
                Note: Restricting essential cookies will make the administrative control panel unusable as Clerk SSO credentials cannot be processed.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

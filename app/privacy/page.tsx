import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Shield, Clock, FileText } from 'lucide-react';

import { getBusinessConfig } from '@/lib/config';

export async function generateMetadata() {
  const config = await getBusinessConfig();
  return {
    title: `Privacy Policy | ${config.companyName}`,
    description: `Privacy Policy and data protection terms for ${config.companyName}.`,
    alternates: {
      canonical: `${config.siteUrl}/privacy`,
    },
  };
}

export default async function PrivacyPolicyPage() {
  const config = await getBusinessConfig();
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
              <Shield className="w-3.5 h-3.5" />
              LEGAL DOCUMENTATION
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
              Privacy Policy
            </h1>
            <p className="text-text-secondary text-sm md:text-base leading-relaxed flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Last updated: {lastUpdated}
            </p>
          </div>

          {/* Policy Document Body */}
          <div className="glass-panel border-border bg-bg-secondary/60 backdrop-blur-md rounded-2xl p-8 md:p-10 space-y-8 text-xs md:text-sm text-text-secondary leading-relaxed select-text">
            
            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 1. Introduction
              </h2>
              <p>
                Welcome to {config.companyName} (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;). We operate the website located at{' '}
                <a href={config.siteUrl} className="text-accent hover:underline font-mono">{config.siteUrl}</a>{' '}
                and are committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit and use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 2. Information We Collect
              </h2>
              <p>
                We collect personal information that you voluntarily provide to us when you fill out contact forms, subscribe to our newsletter, or authenticate as an administrator. This includes:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Contact Information:</strong> Name, email address, subject, and message content when submitting contact requests.</li>
                <li><strong className="text-white">Subscription Data:</strong> Email address for newsletter delivery.</li>
                <li><strong className="text-white">Authentication Details:</strong> Email, profile information, and security credentials provided via Clerk SSO during admin sign-in.</li>
                <li><strong className="text-white">Technical logs:</strong> IP address, browser type, referral paths, device parameters, and usage events captured anonymously.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 3. Processing Services & Data Storage
              </h2>
              <p>
                To provide a high-performance experience, we integrate with industry-leading third-party service providers. Your data is processed and stored across the following infrastructure:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Authentication (Clerk):</strong> All user registration and admin authentication sessions are managed securely by Clerk. We do not store passwords on our servers.</li>
                <li><strong className="text-white">Relational Database (Neon):</strong> Product listings, category configurations, and content CMS settings are stored in Neon PostgreSQL databases.</li>
                <li><strong className="text-white">Transactional Emails (Resend):</strong> Contact messages, broadcast newsletter campaigns, and support replies are dispatched securely via Resend.</li>
                <li><strong className="text-white">Analytics & Performance (Google Analytics, Vercel, Microsoft Clarity):</strong> We monitor website traffic aggregates, speed vitals, and user interface engagement anonymously.</li>
                <li><strong className="text-white">CDN & Assets (Cloudinary):</strong> Media assets (images, project screenshots, logos) are served via Cloudinary.</li>
                <li><strong className="text-white">Rate-Limiting (Upstash Redis):</strong> Secure session identifiers and request rate limit states are cached temporarily using Upstash.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 4. Cookies and Session Tracking
              </h2>
              <p>
                We use cookies to maintain active administrator sessions, analyze traffic, and enforce security rate limits.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-white">Essential Cookies:</strong> Clerk session tokens and CSRF verification cookies required for system operations.</li>
                <li><strong className="text-white">Visitor Tracking Cookie:</strong> A local cookie named <code className="text-white bg-white/5 px-1 py-0.5 rounded font-mono text-xs">{config.companyName.toLowerCase()}_visitor_id</code> stores an anonymous UUID for traffic analytics.</li>
                <li><strong className="text-white">Security Cookies:</strong> Cloudflare Turnstile token checks and rate limiter buckets to secure endpoint submissions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 5. Data Security and Retention
              </h2>
              <p>
                All data in transit is protected using TLS/HTTPS encryption protocols. We retain your personal data (such as newsletter emails or contact form queries) only for as long as necessary to fulfill the purposes outlined in this policy or to comply with technical recordkeeping obligations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 6. Legal Rights (GDPR & CCPA compliance)
              </h2>
              <p>
                Depending on your location, you may have rights regarding your personal information under the General Data Protection Regulation (GDPR) or California Consumer Privacy Act (CCPA). These include:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The right to request access to and copy your stored personal data.</li>
                <li>The right to request rectification of inaccurate data or complete erasure.</li>
                <li>The right to withdraw newsletter opt-in consent at any time via the unsubscribe links.</li>
              </ul>
              <p>
                To exercise any of these rights, please contact our support team.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-accent" /> 7. Contact Information
              </h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy, please contact our data team directly:
              </p>
              <div className="bg-bg-primary/60 border border-border p-4 rounded-xl space-y-1 font-mono text-[11px] text-white">
                <p>Email: {config.contactEmail}</p>
                <p>Mailing Address: {config.address}</p>
                <p>Encryption: Transport Layer Security (TLS v1.3)</p>
              </div>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

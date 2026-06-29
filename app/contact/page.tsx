import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react';
import Github from '@/components/icons/GithubIcon';
import { Twitter, Linkedin, Youtube } from '@/components/icons/SocialIcons';
import prisma from '@/lib/prisma';
import ContactForm from './ContactForm';
import FAQSection from '@/components/shared/FAQSection';
import { cookies } from 'next/headers';

export default async function ContactPage() {
  // Opt-out of static rendering to query DB dynamically
  await cookies();

  // Fetch CMS settings from the DB
  const [contactSection, socialSection] = await Promise.all([
    prisma.homepageSection.findUnique({
      where: { sectionType: 'contact' },
    }).catch(() => null),
    prisma.homepageSection.findUnique({
      where: { sectionType: 'social' },
    }).catch(() => null),
  ]);

  const title = contactSection?.title || 'Contact Us';
  const subtitle = contactSection?.subtitle || 'Have a technical inquiry, feedback, or need collaboration? Get in touch with our engineering team directly.';
  
  const config = (contactSection?.config as Record<string, string>) || {};
  const email = config.email || 'contact@warishlabs.in';
  const phone = config.phone || '';
  const address = config.address || 'New Delhi, India';
  const responseTime = config.responseTime || 'Under 24 hours';
  const secureRouting = config.secureRouting || 'Messages are stored inside a TLS encrypted datastore and sent to resend relays.';

  const socialConfig = (socialSection?.config as Record<string, string>) || {};
  const githubUrl = socialConfig.githubUrl || '';
  const twitterUrl = socialConfig.twitterUrl || '';
  const linkedinUrl = socialConfig.linkedinUrl || '';
  const youtubeUrl = socialConfig.youtubeUrl || '';

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-black text-white pt-32 pb-24 relative select-none">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/3 blur-3xl -z-10 pointer-events-none" />

        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Info Text */}
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" />
                TRANSMISSION LINE
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-none">
                {title}
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                {subtitle}
              </p>

              {/* Dynamic Contact details */}
              <div className="space-y-4 pt-6 border-t border-border/40 text-xs">
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <Mail className="w-4 h-4 text-accent" />
                  <span className="text-white font-mono">{email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-2.5 text-text-secondary">
                    <Phone className="w-4 h-4 text-accent" />
                    <span className="text-white font-mono">{phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-text-secondary">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-white">{address}</span>
                </div>
              </div>

              {/* Social Channels */}
              {(githubUrl || twitterUrl || linkedinUrl || youtubeUrl) && (
                <div className="flex gap-4 pt-6 border-t border-border/40 items-center">
                  {githubUrl && (
                    <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors" title="GitHub">
                      <Github className="w-4.5 h-4.5 text-accent" />
                    </a>
                  )}
                  {twitterUrl && (
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors" title="Twitter">
                      <Twitter className="w-4.5 h-4.5 text-accent" />
                    </a>
                  )}
                  {linkedinUrl && (
                    <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors" title="LinkedIn">
                      <Linkedin className="w-4.5 h-4.5 text-accent" />
                    </a>
                  )}
                  {youtubeUrl && (
                    <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-white transition-colors" title="YouTube">
                      <Youtube className="w-4.5 h-4.5 text-accent" />
                    </a>
                  )}
                </div>
              )}

              {/* Assurances */}
              <div className="space-y-3 pt-6 border-t border-border/40 text-[10px] text-text-tertiary">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  <p><strong>Response guarantee:</strong> {responseTime}</p>
                </div>
                <div className="flex gap-2 text-text-secondary">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <p><strong>Secure routing:</strong> {secureRouting}</p>
                </div>
              </div>
            </div>

            {/* Right Card Form */}
            <div className="lg:col-span-7">
              <ContactForm />
            </div>
          </div>

          {/* FAQ Accordion Section */}
          <div id="faq" className="mt-20 pt-16 border-t border-border/40">
            <FAQSection />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


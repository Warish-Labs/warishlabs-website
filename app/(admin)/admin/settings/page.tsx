'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings, Save, Loader2, Info, Mail, Phone, MapPin, Eye, Trash2, Plus, Share2,
  ToggleLeft, ToggleRight, GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface SectionSettings {
  title: string;
  subtitle: string;
  config: Record<string, unknown>;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string | null;
  isVisible: boolean;
  sortOrder: number;
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') return true; // empty is allowed (means "not configured")
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact' | 'social'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitPending, setIsSubmitPending] = useState(false);

  // Form states matching tabs
  const [hero, setHero] = useState<SectionSettings>({ title: '', subtitle: '', config: {} });
  const [about, setAbout] = useState<SectionSettings>({ title: '', subtitle: '', config: { philosophy: [], highlights: [] } });
  const [contact, setContact] = useState<SectionSettings>({ title: '', subtitle: '', config: {} });

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSortOrder, setNewSortOrder] = useState(0);
  const [isSavingLink, setIsSavingLink] = useState(false);

  // Track unsaved changes for dirty warning
  const heroInitialRef = useRef<string>('');
  const aboutInitialRef = useRef<string>('');
  const contactInitialRef = useRef<string>('');

  // Add About Card input states
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightDesc, setNewHighlightDesc] = useState('');
  const [newHighlightIcon, setNewHighlightIcon] = useState('🚀');

  // Fetch CMS settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.hero) {
            const h = { title: s.hero.title, subtitle: s.hero.subtitle, config: s.hero.config || {} };
            setHero(h);
            heroInitialRef.current = JSON.stringify(h);
          }
          if (s.about) {
            const a = { title: s.about.title, subtitle: s.about.subtitle, config: s.about.config || { philosophy: [], highlights: [] } };
            setAbout(a);
            aboutInitialRef.current = JSON.stringify(a);
          }
          if (s.contact) {
            const c = { title: s.contact.title, subtitle: s.contact.subtitle, config: s.contact.config || {} };
            setContact(c);
            contactInitialRef.current = JSON.stringify(c);
          }
        }
      } catch {
        toast.error('Failed to load site configurations.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // Fetch social links when social tab is active
  useEffect(() => {
    if (activeTab === 'social') {
      fetchSocialLinks();
    }
  }, [activeTab]);

  async function fetchSocialLinks() {
    setSocialLoading(true);
    try {
      const res = await fetch('/api/admin/social-links');
      if (res.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSocialLinks(data.links as SocialLink[]);
      } else {
        toast.error(data.error || 'Failed to load social links');
      }
    } catch {
      toast.error('Network error loading social links');
    } finally {
      setSocialLoading(false);
    }
  }

  const handleSave = async (sectionType: 'hero' | 'about' | 'contact') => {
    setIsSubmitPending(true);
    let payload = {};
    if (sectionType === 'hero') payload = { sectionType: 'hero', ...hero };
    else if (sectionType === 'about') payload = { sectionType: 'about', ...about };
    else if (sectionType === 'contact') payload = { sectionType: 'contact', ...contact };

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(`CMS "${sectionType}" configuration updated successfully!`);
        // Update initial snapshot
        if (sectionType === 'hero') heroInitialRef.current = JSON.stringify(hero);
        else if (sectionType === 'about') aboutInitialRef.current = JSON.stringify(about);
        else if (sectionType === 'contact') contactInitialRef.current = JSON.stringify(contact);
      } else {
        toast.error(result.error || 'Failed to update configuration.');
      }
    } catch {
      toast.error('An error occurred during submission.');
    } finally {
      setIsSubmitPending(false);
    }
  };

  const handleAddHighlight = () => {
    if (!newHighlightTitle.trim() || !newHighlightDesc.trim()) {
      toast.error('Please specify a title and description for the card.');
      return;
    }

    const currentHighlights = (about.config.highlights as Record<string, string>[]) || [];
    const newItem = {
      title: newHighlightTitle.trim(),
      description: newHighlightDesc.trim(),
      icon: newHighlightIcon.trim() || '🚀',
    };

    setAbout({
      ...about,
      config: {
        ...about.config,
        highlights: [...currentHighlights, newItem],
      },
    });

    setNewHighlightTitle('');
    setNewHighlightDesc('');
    setNewHighlightIcon('🚀');
    toast.success('About card item staged. Click "Save About Settings" to write changes to the DB.');
  };

  const handleRemoveHighlight = (idx: number) => {
    const currentHighlights = [...((about.config.highlights as Record<string, string>[]) || [])];
    currentHighlights.splice(idx, 1);

    setAbout({
      ...about,
      config: {
        ...about.config,
        highlights: currentHighlights,
      },
    });
    toast.success('Staged deletion of card. Click "Save About Settings" to apply changes.');
  };

  // Social link handlers
  const handleAddSocialLink = async () => {
    if (!newPlatform.trim()) {
      toast.error('Platform name is required.');
      return;
    }
    if (newUrl && !isValidUrl(newUrl)) {
      toast.error('Please enter a valid http/https URL.');
      return;
    }

    setIsSavingLink(true);
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: newPlatform.trim(),
          url: newUrl.trim() || null,
          isVisible: true,
          sortOrder: newSortOrder,
        }),
      });

      if (res.status === 401) { toast.error('Unauthorized.'); return; }

      const data = await res.json();
      if (data.success) {
        toast.success(`Social link "${newPlatform.trim()}" saved.`);
        setNewPlatform('');
        setNewUrl('');
        setNewSortOrder(0);
        await fetchSocialLinks();
      } else {
        toast.error(data.error || 'Failed to save social link');
      }
    } catch {
      toast.error('Network error saving social link');
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleToggleVisibility = async (link: SocialLink) => {
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: link.platform,
          url: link.url,
          isVisible: !link.isVisible,
          sortOrder: link.sortOrder,
        }),
      });
      if (res.status === 401) { toast.error('Unauthorized.'); return; }
      const data = await res.json();
      if (data.success) {
        setSocialLinks((prev) =>
          prev.map((l) => l.platform === link.platform ? { ...l, isVisible: !l.isVisible } : l)
        );
        toast.success(`Visibility updated for ${link.platform}.`);
      } else {
        toast.error(data.error || 'Failed to update visibility');
      }
    } catch {
      toast.error('Network error updating visibility');
    }
  };

  const handleUpdateUrl = async (link: SocialLink, newUrlValue: string) => {
    if (newUrlValue && !isValidUrl(newUrlValue)) {
      toast.error('Please enter a valid http/https URL.');
      return;
    }
    try {
      const res = await fetch('/api/admin/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: link.platform,
          url: newUrlValue.trim() || null,
          isVisible: link.isVisible,
          sortOrder: link.sortOrder,
        }),
      });
      if (res.status === 401) { toast.error('Unauthorized.'); return; }
      const data = await res.json();
      if (data.success) {
        setSocialLinks((prev) =>
          prev.map((l) => l.platform === link.platform ? { ...l, url: newUrlValue.trim() || null } : l)
        );
        toast.success(`URL updated for ${link.platform}.`);
      } else {
        toast.error(data.error || 'Failed to update URL');
      }
    } catch {
      toast.error('Network error updating URL');
    }
  };

  const handleDeleteSocialLink = async (platform: string) => {
    if (!confirm(`Remove social link for "${platform}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/social-links?platform=${encodeURIComponent(platform)}`, {
        method: 'DELETE',
      });
      if (res.status === 401) { toast.error('Unauthorized.'); return; }
      const data = await res.json();
      if (data.success) {
        setSocialLinks((prev) => prev.filter((l) => l.platform !== platform));
        toast.success(`Social link "${platform}" removed.`);
      } else {
        toast.error(data.error || 'Failed to delete social link');
      }
    } catch {
      toast.error('Network error deleting social link');
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-accent" />
          Console Configurations
        </h1>
        <p className="text-text-secondary text-sm">
          Dynamically customize core headlines, about profile highlights, contact information, and social channels.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-px overflow-x-auto">
        {(['hero', 'about', 'contact', 'social'] as const).map((tab) => (
          <button
            key={tab}
            id={`settings-tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            aria-selected={activeTab === tab}
            role="tab"
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap",
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-white"
            )}
          >
            {tab === 'social' ? '🔗 Social Links' : `${tab} section`}
          </button>
        ))}
      </div>

      {isLoading && activeTab !== 'social' ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-secondary text-xs">Loading CMS config map...</p>
        </div>
      ) : (
        <div className="space-y-6" role="tabpanel">
          {/* TAB 1: HERO */}
          {activeTab === 'hero' && (
            <Card className="glass-panel border-border shadow-card relative overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent" /> Hero Showcase Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hero-title" className="text-xs font-semibold text-text-secondary">Hero Title</Label>
                    <Input
                      id="hero-title"
                      value={hero.title}
                      onChange={(e) => setHero({ ...hero, title: e.target.value })}
                      placeholder="e.g. We Construct High-Velocity Systems"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero-sub" className="text-xs font-semibold text-text-secondary">Hero Description</Label>
                    <Textarea
                      id="hero-sub"
                      value={hero.subtitle}
                      onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                      rows={3}
                      placeholder="e.g. WarishLabs builds high-performance tools..."
                      className="bg-bg-primary border-border focus:border-accent text-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-cta-txt" className="text-xs font-semibold text-text-secondary">Primary CTA Text</Label>
                      <Input
                        id="hero-cta-txt"
                        value={(hero.config.ctaPrimaryText as string) || ''}
                        onChange={(e) => setHero({ ...hero, config: { ...hero.config, ctaPrimaryText: e.target.value } })}
                        placeholder="e.g. Explore Products"
                        className="bg-bg-primary border-border focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-cta-url" className="text-xs font-semibold text-text-secondary">Primary CTA URL</Label>
                      <Input
                        id="hero-cta-url"
                        value={(hero.config.ctaPrimaryUrl as string) || ''}
                        onChange={(e) => setHero({ ...hero, config: { ...hero.config, ctaPrimaryUrl: e.target.value } })}
                        placeholder="e.g. /products"
                        className="bg-bg-primary border-border focus:border-accent text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
                    id="save-hero-btn"
                    onClick={() => handleSave('hero')}
                    disabled={isSubmitPending}
                    className="bg-accent hover:bg-accent-hover text-white flex items-center gap-2 cursor-pointer shadow-accent font-semibold"
                  >
                    {isSubmitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Hero Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <Card className="glass-panel border-border shadow-card relative overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent" /> About Section profile settings
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="about-title" className="text-xs font-semibold text-text-secondary">Profile Headline</Label>
                    <Input
                      id="about-title"
                      value={about.title}
                      onChange={(e) => setAbout({ ...about, title: e.target.value })}
                      placeholder="e.g. About WarishLabs"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-sub" className="text-xs font-semibold text-text-secondary">Subtitle Summary</Label>
                    <Textarea
                      id="about-sub"
                      value={about.subtitle}
                      onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                      rows={3}
                      placeholder="e.g. WarishLabs is a software engineering laboratory..."
                      className="bg-bg-primary border-border focus:border-accent text-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="about-phil" className="text-xs font-semibold text-text-secondary">Our Philosophy Paragraphs (One per line)</Label>
                    <Textarea
                      id="about-phil"
                      value={((about.config.philosophy as string[]) || []).join('\n')}
                      onChange={(e) => setAbout({
                        ...about,
                        config: {
                          ...about.config,
                          philosophy: e.target.value.split('\n').filter((p) => p.trim() !== ''),
                        },
                      })}
                      rows={5}
                      placeholder="Paragraph 1&#13;Paragraph 2"
                      className="bg-bg-primary border-border focus:border-accent text-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-4 border-t border-border/40 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">About Profile Highlight Cards</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {((about.config.highlights as Record<string, string>[]) || []).map((hl, idx) => (
                        <div key={idx} className="p-4 bg-bg-secondary border border-border rounded-lg flex items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-base select-none">{hl.icon}</span>
                              <h4 className="text-xs font-bold text-white truncate">{hl.title}</h4>
                            </div>
                            <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">
                              {hl.description}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx)}
                            aria-label={`Remove highlight card: ${hl.title}`}
                            className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-black/40 border border-white/5 rounded-lg space-y-4">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Add Highlight Card</h4>
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-3 space-y-1.5">
                          <Label className="text-[10px] text-zinc-400">Card Symbol / Emoji</Label>
                          <Input
                            value={newHighlightIcon}
                            onChange={(e) => setNewHighlightIcon(e.target.value)}
                            placeholder="e.g. 🚀"
                            className="bg-bg-primary border-border focus:border-accent text-white"
                          />
                        </div>
                        <div className="md:col-span-9 space-y-1.5">
                          <Label className="text-[10px] text-zinc-400">Card Title</Label>
                          <Input
                            value={newHighlightTitle}
                            onChange={(e) => setNewHighlightTitle(e.target.value)}
                            placeholder="e.g. High-Performance APIs"
                            className="bg-bg-primary border-border focus:border-accent text-white"
                          />
                        </div>
                        <div className="md:col-span-12 space-y-1.5">
                          <Label className="text-[10px] text-zinc-400">Card Description</Label>
                          <Textarea
                            value={newHighlightDesc}
                            onChange={(e) => setNewHighlightDesc(e.target.value)}
                            placeholder="Provide specifications, Philosophy, or highlight details..."
                            rows={2}
                            className="bg-bg-primary border-border focus:border-accent text-white text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-4 py-1.5 bg-white/5 border border-white/10 hover:border-accent hover:text-white rounded text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Plus className="w-3.5 h-3.5" /> Stage Card Item
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
                    id="save-about-btn"
                    onClick={() => handleSave('about')}
                    disabled={isSubmitPending}
                    className="bg-accent hover:bg-accent-hover text-white flex items-center gap-2 cursor-pointer shadow-accent font-semibold"
                  >
                    {isSubmitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save About Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: CONTACT */}
          {activeTab === 'contact' && (
            <Card className="glass-panel border-border shadow-card relative overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                  <Mail className="w-4 h-4 text-accent" /> Contact Page &amp; Info Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contact-title" className="text-xs font-semibold text-text-secondary">Page Header Title</Label>
                    <Input
                      id="contact-title"
                      value={contact.title}
                      onChange={(e) => setContact({ ...contact, title: e.target.value })}
                      placeholder="e.g. Contact Us"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contact-sub" className="text-xs font-semibold text-text-secondary">Subtitle Description</Label>
                    <Textarea
                      id="contact-sub"
                      value={contact.subtitle}
                      onChange={(e) => setContact({ ...contact, subtitle: e.target.value })}
                      rows={2}
                      placeholder="e.g. Have a technical inquiry? Get in touch with our team directly."
                      className="bg-bg-primary border-border focus:border-accent text-white text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Contact Email Address
                    </Label>
                    <Input
                      id="contact-email"
                      value={(contact.config.email as string) || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, email: e.target.value } })}
                      placeholder="e.g. contact@warishlabs.in"
                      className="bg-bg-primary border-border focus:border-accent text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number (Optional)
                    </Label>
                    <Input
                      id="contact-phone"
                      value={(contact.config.phone as string) || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, phone: e.target.value } })}
                      placeholder="e.g. +91 99999 99999"
                      className="bg-bg-primary border-border focus:border-accent text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contact-addr" className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Office / Laboratory Location Address
                    </Label>
                    <Input
                      id="contact-addr"
                      value={(contact.config.address as string) || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, address: e.target.value } })}
                      placeholder="e.g. New Delhi, India"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-response" className="text-xs font-semibold text-text-secondary">Response Time Guarantee</Label>
                    <Input
                      id="contact-response"
                      value={(contact.config.responseTime as string) || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, responseTime: e.target.value } })}
                      placeholder="e.g. Under 24 hours"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-routing" className="text-xs font-semibold text-text-secondary">Secure Routing Assurance Info</Label>
                    <Input
                      id="contact-routing"
                      value={(contact.config.secureRouting as string) || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, secureRouting: e.target.value } })}
                      placeholder="e.g. Messages are stored inside a TLS encrypted datastore..."
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
                    id="save-contact-btn"
                    onClick={() => handleSave('contact')}
                    disabled={isSubmitPending}
                    className="bg-accent hover:bg-accent-hover text-white flex items-center gap-2 cursor-pointer shadow-accent font-semibold"
                  >
                    {isSubmitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Contact Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: SOCIAL LINKS */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <Card className="glass-panel border-border shadow-card overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-accent" /> Social Channels Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-text-secondary text-xs leading-relaxed">
                    Manage which social channels appear in the site footer and contact page. Only visible links with a configured URL will be shown publicly. GitHub is excluded from the predefined defaults — add it manually if desired.
                  </p>
                </CardContent>
              </Card>

              {/* Add New Social Link */}
              <Card className="glass-panel border-border shadow-card overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Plus className="w-4 h-4 text-accent" /> Add / Update Social Link
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-1.5">
                      <Label htmlFor="new-platform" className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                        Platform Name
                      </Label>
                      <Input
                        id="new-platform"
                        value={newPlatform}
                        onChange={(e) => setNewPlatform(e.target.value)}
                        placeholder="e.g. linkedin, youtube"
                        className="bg-bg-primary border-border focus:border-accent text-white font-mono text-xs"
                      />
                      <p className="text-[10px] text-text-tertiary">Lowercase. Letters, numbers, hyphens only.</p>
                    </div>
                    <div className="md:col-span-7 space-y-1.5">
                      <Label htmlFor="new-url" className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                        Profile URL
                      </Label>
                      <Input
                        id="new-url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://linkedin.com/company/warishlabs"
                        type="url"
                        className="bg-bg-primary border-border focus:border-accent text-white font-mono text-xs"
                      />
                      <p className="text-[10px] text-text-tertiary">Must be a valid https:// URL. Leave empty to save platform without URL.</p>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <Label htmlFor="new-sort" className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                        Sort Order
                      </Label>
                      <Input
                        id="new-sort"
                        type="number"
                        min={0}
                        value={newSortOrder}
                        onChange={(e) => setNewSortOrder(parseInt(e.target.value, 10) || 0)}
                        className="bg-bg-primary border-border focus:border-accent text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      id="add-social-link-btn"
                      onClick={handleAddSocialLink}
                      disabled={isSavingLink}
                      aria-label="Add or update social link"
                      className="px-5 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {isSavingLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                      Save Link
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Existing Social Links Table */}
              <Card className="glass-panel border-border shadow-card overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-accent" /> Configured Social Links
                  </CardTitle>
                  <span className="bg-accent-subtle/50 text-accent border border-accent/15 px-3 py-1 rounded-full text-xs font-bold">
                    {socialLinks.length} links
                  </span>
                </CardHeader>
                <CardContent className="pt-6 px-0">
                  {socialLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 text-accent animate-spin" />
                    </div>
                  ) : socialLinks.length === 0 ? (
                    <div className="py-12 text-center text-text-tertiary text-sm">
                      No social links configured yet. Add one above.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left" role="table" aria-label="Social links table">
                        <thead>
                          <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                            <th className="px-6 py-3">Platform</th>
                            <th className="px-6 py-3">URL</th>
                            <th className="px-6 py-3">Sort</th>
                            <th className="px-6 py-3">Visible</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                          {socialLinks.map((link) => (
                            <SocialLinkRow
                              key={link.platform}
                              link={link}
                              onToggleVisibility={handleToggleVisibility}
                              onUpdateUrl={handleUpdateUrl}
                              onDelete={handleDeleteSocialLink}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- SocialLinkRow sub-component: inline URL editing with save on blur ---

interface SocialLinkRowProps {
  link: SocialLink;
  onToggleVisibility: (link: SocialLink) => void;
  onUpdateUrl: (link: SocialLink, newUrl: string) => void;
  onDelete: (platform: string) => void;
}

function SocialLinkRow({ link, onToggleVisibility, onUpdateUrl, onDelete }: SocialLinkRowProps) {
  const [editUrl, setEditUrl] = useState(link.url ?? '');
  const [isDirty, setIsDirty] = useState(false);

  const handleBlur = () => {
    if (isDirty) {
      onUpdateUrl(link, editUrl);
      setIsDirty(false);
    }
  };

  return (
    <tr className="hover:bg-bg-card/30 transition-colors">
      <td className="px-6 py-4">
        <span className="font-mono text-white text-xs bg-bg-card border border-border px-2 py-0.5 rounded">
          {link.platform}
        </span>
      </td>
      <td className="px-6 py-4 min-w-[280px]">
        <input
          type="url"
          value={editUrl}
          aria-label={`URL for ${link.platform}`}
          onChange={(e) => { setEditUrl(e.target.value); setIsDirty(true); }}
          onBlur={handleBlur}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
          placeholder="https://..."
          className="w-full bg-bg-primary border border-border focus:border-accent text-white text-xs rounded px-2 py-1.5 outline-none font-mono focus-visible:ring-1 focus-visible:ring-accent"
        />
        {isDirty && <p className="text-[9px] text-accent mt-0.5">Press Enter or click away to save URL</p>}
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-mono text-text-secondary">{link.sortOrder}</span>
      </td>
      <td className="px-6 py-4">
        <button
          type="button"
          onClick={() => onToggleVisibility(link)}
          aria-label={link.isVisible ? `Hide ${link.platform}` : `Show ${link.platform}`}
          aria-pressed={link.isVisible}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded cursor-pointer"
        >
          {link.isVisible ? (
            <><ToggleRight className="w-5 h-5 text-emerald-400" /> <span className="text-emerald-400">Visible</span></>
          ) : (
            <><ToggleLeft className="w-5 h-5 text-text-tertiary" /> <span className="text-text-tertiary">Hidden</span></>
          )}
        </button>
      </td>
      <td className="px-6 py-4 text-right">
        <button
          type="button"
          onClick={() => onDelete(link.platform)}
          aria-label={`Delete social link for ${link.platform}`}
          className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors cursor-pointer inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

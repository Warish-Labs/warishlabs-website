'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Loader2, Info, Mail, Phone, MapPin, Eye, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface SectionSettings {
  title: string;
  subtitle: string;
  config: Record<string, any>;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'contact'>('hero');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitPending, setIsSubmitPending] = useState(false);

  // Form states matching tabs
  const [hero, setHero] = useState<SectionSettings>({ title: '', subtitle: '', config: {} });
  const [about, setAbout] = useState<SectionSettings>({ title: '', subtitle: '', config: { philosophy: [], highlights: [] } });
  const [contact, setContact] = useState<SectionSettings>({ title: '', subtitle: '', config: {} });

  // Add About Card input states
  const [newHighlightTitle, setNewHighlightTitle] = useState('');
  const [newHighlightDesc, setNewHighlightDesc] = useState('');
  const [newHighlightIcon, setNewHighlightIcon] = useState('🚀');

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.hero) setHero({ title: s.hero.title, subtitle: s.hero.subtitle, config: s.hero.config || {} });
          if (s.about) setAbout({ title: s.about.title, subtitle: s.about.subtitle, config: s.about.config || { philosophy: [], highlights: [] } });
          if (s.contact) setContact({ title: s.contact.title, subtitle: s.contact.subtitle, config: s.contact.config || {} });
        }
      } catch (err) {
        toast.error('Failed to load site configurations.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

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

      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(`CMS "${sectionType}" configuration updated successfully!`);
      } else {
        toast.error(result.error || 'Failed to update configuration.');
      }
    } catch (err) {
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

    const currentHighlights = about.config.highlights || [];
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
    const currentHighlights = [...(about.config.highlights || [])];
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

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-accent" />
          Console Configurations
        </h1>
        <p className="text-text-secondary text-sm">
          Dynamically customize core headlines, about profile highlights, and contact information details.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border/40 pb-px">
        {(['hero', 'about', 'contact'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer",
              activeTab === tab
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-white"
            )}
          >
            {tab} section
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-secondary text-xs">Loading CMS config map...</p>
        </div>
      ) : (
        <div className="space-y-6">
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
                  {/* Headline */}
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

                  {/* Subtitle */}
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

                  {/* Primary CTA */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-cta-txt" className="text-xs font-semibold text-text-secondary">Primary CTA Text</Label>
                      <Input
                        id="hero-cta-txt"
                        value={hero.config.ctaPrimaryText || ''}
                        onChange={(e) => setHero({ ...hero, config: { ...hero.config, ctaPrimaryText: e.target.value } })}
                        placeholder="e.g. Explore Products"
                        className="bg-bg-primary border-border focus:border-accent text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-cta-url" className="text-xs font-semibold text-text-secondary">Primary CTA URL</Label>
                      <Input
                        id="hero-cta-url"
                        value={hero.config.ctaPrimaryUrl || ''}
                        onChange={(e) => setHero({ ...hero, config: { ...hero.config, ctaPrimaryUrl: e.target.value } })}
                        placeholder="e.g. /products"
                        className="bg-bg-primary border-border focus:border-accent text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
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
                  {/* Headline */}
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

                  {/* Subtitle */}
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

                  {/* Philosophy Editor */}
                  <div className="space-y-2">
                    <Label htmlFor="about-phil" className="text-xs font-semibold text-text-secondary">Our Philosophy Paragraphs (One per line)</Label>
                    <Textarea
                      id="about-phil"
                      value={(about.config.philosophy || []).join('\n')}
                      onChange={(e) => setAbout({ 
                        ...about, 
                        config: { 
                          ...about.config, 
                          philosophy: e.target.value.split('\n').filter(p => p.trim() !== '') 
                        } 
                      })}
                      rows={5}
                      placeholder="Paragraph 1&#13;Paragraph 2"
                      className="bg-bg-primary border-border focus:border-accent text-white text-xs leading-relaxed"
                    />
                  </div>

                  {/* About Highlight Cards CRUD manager */}
                  <div className="space-y-4 border-t border-border/40 pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">About Profile Highlight Cards</h3>
                    
                    {/* Staged Cards List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(about.config.highlights || []).map((hl: any, idx: number) => (
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
                            className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove Card Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Staging Fields Form */}
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
                            placeholder="Provide specifications, Philosophy, or highlight details for this card..."
                            rows={2}
                            className="bg-bg-primary border-border focus:border-accent text-white text-xs"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-4 py-1.5 bg-white/5 border border-white/10 hover:border-accent hover:text-white rounded text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Stage Card Item
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
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
                  <Mail className="w-4 h-4 text-accent" /> Contact Page & Info Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Headline */}
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

                  {/* Subtitle */}
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

                  {/* Contact Info details */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-email" className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Contact Email Address</Label>
                    <Input
                      id="contact-email"
                      value={contact.config.email || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, email: e.target.value } })}
                      placeholder="e.g. contact@warishlabs.in"
                      className="bg-bg-primary border-border focus:border-accent text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-phone" className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number (Optional)</Label>
                    <Input
                      id="contact-phone"
                      value={contact.config.phone || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, phone: e.target.value } })}
                      placeholder="e.g. +91 99999 99999"
                      className="bg-bg-primary border-border focus:border-accent text-white font-mono"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contact-addr" className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Office / Laboratory Location Address</Label>
                    <Input
                      id="contact-addr"
                      value={contact.config.address || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, address: e.target.value } })}
                      placeholder="e.g. New Delhi, India"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  {/* Assurances */}
                  <div className="space-y-2">
                    <Label htmlFor="contact-response" className="text-xs font-semibold text-text-secondary">Response Time Guarantee</Label>
                    <Input
                      id="contact-response"
                      value={contact.config.responseTime || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, responseTime: e.target.value } })}
                      placeholder="e.g. Under 24 hours"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-routing" className="text-xs font-semibold text-text-secondary">Secure Routing Assurance Info</Label>
                    <Input
                      id="contact-routing"
                      value={contact.config.secureRouting || ''}
                      onChange={(e) => setContact({ ...contact, config: { ...contact.config, secureRouting: e.target.value } })}
                      placeholder="e.g. Messages are stored inside a TLS encrypted datastore..."
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border/40">
                  <Button
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
        </div>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

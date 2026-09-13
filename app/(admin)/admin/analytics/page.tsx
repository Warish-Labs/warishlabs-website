'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  BarChart2,
  Globe,
  Clock,
  Compass,
  Search,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  Copy,
  Check,
  Users,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  totalVisitors: number;
  uniqueVisitors: number;
  sessions: number;
  pageViews: number;
  visitorsToday: number;
  visitorsOverTime: Array<{ date: string; pageViews: number; visitors: number }>;
  visitorsByProject: Array<{ project: string; slug: string; sessions: number; pageViews: number }>;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ referrer: string; count: number }>;
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-white/10 bg-zinc-900/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
      <p className="text-text-tertiary font-mono mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const [selectedProject, setSelectedProject] = useState('all');
  const [copied, setCopied] = useState(false);

  // Add Project Modal state
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSlug, setNewProjectSlug] = useState('');
  const [newProjectDomain, setNewProjectDomain] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const fetchAnalytics = async (selectedRange: string, project: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}&project=${project}`);
      const resData = await res.json();
      if (resData.success) {
        setData(resData);
      } else {
        toast.error(resData.error || 'Failed to fetch analytics');
      }
    } catch {
      toast.error('Network error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range, selectedProject);
  }, [range, selectedProject]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !newProjectSlug.trim()) {
      toast.error('Project Name and Slug are required');
      return;
    }

    setIsCreatingProject(true);
    try {
      const res = await fetch('/api/admin/analytics/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          slug: newProjectSlug.trim().toLowerCase(),
          domain: newProjectDomain.trim() || undefined,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        toast.success(`Project '${resData.project.name}' registered successfully!`);
        setIsAddProjectOpen(false);
        setNewProjectName('');
        setNewProjectSlug('');
        setNewProjectDomain('');
        fetchAnalytics(range, selectedProject);
      } else {
        toast.error(resData.error || 'Failed to register project');
      }
    } catch {
      toast.error('Network error registering project');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleCopySetupPrompt = () => {
    const promptLines = [
      '# ANTIGRAVITY CENTRALIZED VISITOR ANALYTICS INTEGRATION PROMPT',
      '',
      "You are integrating this application into WarishLabs' centralized visitor analytics system.",
      'Do NOT create a new database or new schema — a shared, multi-tenant analytics service exists on WarishLabs.',
      '',
      '---',
      '',
      '## 0. Architecture & API Payload Contract',
      '',
      '- **Central Ingest API Endpoint**: https://warishlabs.in/api/analytics/event',
      '- **Project Identifier Slug**: `<THIS_PROJECT_SLUG>` (e.g. `toolkit`, `forgeflow`, etc.)',
      '- **CORS Support**: Cross-origin requests from subdomains (e.g. `toolkit.warishlabs.in`) are enabled via CORS headers.',
      '- **Fail-Safe Guarantee**: Analytics tracking MUST fail silently. A network timeout or DB glitch must NEVER throw errors, block rendering, or impact user experience.',
      '',
      '### Required JSON Payload Structure (POST to Ingest API):',
      '```json',
      '{',
      '  "projectSlug": "<THIS_PROJECT_SLUG>",',
      '  "projectId": "<THIS_PROJECT_SLUG>",',
      '  "eventName": "page_view",',
      '  "url": "https://toolkit.warishlabs.in/tools/age-calculator",',
      '  "path": "/tools/age-calculator",',
      '  "referrer": null,',
      '  "visitorId": "v_unique_uuid_token"',
      '}',
      '```',
      '*(Note: Send both `projectSlug` and `projectId`. Use `null` for referrer if empty string).*',
      '',
      '---',
      '',
      '## 1. Automated Antigravity Implementation Instructions',
      '',
      '1. **Inspect Framework & Layout**:',
      "   Inspect this project's framework (Next.js App Router, Vite, HTML/JS, or React) and root layout file.",
      '',
      '2. **Add Environment Variables**:',
      '   Add these environment variables to `.env.example` and local `.env`:',
      '   NEXT_PUBLIC_ANALYTICS_API_URL="https://warishlabs.in/api/analytics/event"',
      '   NEXT_PUBLIC_ANALYTICS_PROJECT_ID="<THIS_PROJECT_SLUG>"',
      '',
      '3. **Install / Update Tracker Client (`lib/analytics.ts` or `utils/analytics.ts`)**:',
      '   Create a fail-safe tracking client that persists a first-party `warishlabs_vid` token in local storage and dispatches `page_view` events:',
      '   ```typescript',
      '   export async function trackPageView(path?: string): Promise<void> {',
      "     if (typeof window === 'undefined') return;",
      '     try {',
      '       const visitorId = getOrCreateVisitorId();',
      '       const payload = {',
      "         projectSlug: process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || '<THIS_PROJECT_SLUG>',",
      "         projectId: process.env.NEXT_PUBLIC_ANALYTICS_PROJECT_ID || '<THIS_PROJECT_SLUG>',",
      "         eventName: 'page_view',",
      '         url: window.location.href,',
      '         path: path || window.location.pathname,',
      '         referrer: document.referrer || null,',
      '         visitorId,',
      '       };',
      "       fetch(process.env.NEXT_PUBLIC_ANALYTICS_API_URL || 'https://warishlabs.in/api/analytics/event', {",
      "         method: 'POST',",
      "         mode: 'cors',",
      "         headers: { 'Content-Type': 'application/json' },",
      '         body: JSON.stringify(payload),',
      '       }).catch(() => null);',
      '     } catch {',
      '       // Fail silently',
      '     }',
      '   }',
      '   ```',
      '',
      '4. **Mount Global Route Change Listener**:',
      '   Mount AnalyticsTracker in the root layout (app/layout.tsx or pages/_app.tsx) so route changes trigger trackPageView().',
      '',
      '5. **Validation & Verification**:',
      '   Run npm run typecheck, npm run lint, and npm run build to verify clean compilation.',
      '',
      '---',
      '',
      '## 2. Final Status Summary Output',
      '',
      'At the end of your response, output a clear summary:',
      '',
      '"What user needs to do manually:"',
      '1. Ensure NEXT_PUBLIC_ANALYTICS_API_URL and NEXT_PUBLIC_ANALYTICS_PROJECT_ID are added to Vercel project environment variables for Production & Preview.',
      '2. Ensure PR #34 on warishlabs-website is merged to main so production endpoints support CORS and direct foreign key filtering.',
      '',
      '"What Antigravity handled automatically:"',
      '1. Created fail-safe client tracker (lib/analytics.ts).',
      '2. Integrated root layout route change listener.',
      '3. Updated .env.example and project type definitions.',
      '4. Passed production build verification.',
    ];

    navigator.clipboard.writeText(promptLines.join('\n'));
    setCopied(true);
    toast.success('Enhanced analytics setup prompt copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Bar */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-accent" /> Centralized Visitor Analytics
          </CardTitle>

          <div className="flex flex-wrap items-center gap-3">
            {/* Add Project Button */}
            <button
              onClick={() => setIsAddProjectOpen(true)}
              className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" /> + Add Project
            </button>

            {/* Copy Setup Prompt Button */}
            <button
              onClick={handleCopySetupPrompt}
              className="px-3 py-1.5 bg-accent/10 border border-accent/30 hover:border-accent text-accent hover:text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Prompt Copied!' : 'Copy Setup Prompt for New Project'}
            </button>

            {/* Project Filter Selector */}
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-black/60 border border-white/10 text-white rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="all">All Ecosystem Projects</option>
              <option value="warishlabs-website">WarishLabs Main Website</option>
              {data?.visitorsByProject?.filter(p => p.slug !== 'warishlabs-website').map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.project} ({p.slug})
                </option>
              ))}
            </select>

            {/* Range Selector */}
            <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                    range === r ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-text-secondary text-sm">
            Real-time multi-site visitor telemetry powered by Neon PostgreSQL. Viewing metrics for:{' '}
            <span className="font-bold text-accent">
              {selectedProject === 'all' ? 'All Ecosystem Applications' : selectedProject}
            </span>
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-tertiary text-xs">Fetching analytics telemetry...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-panel border-border bg-bg-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Total Page Views</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.pageViews ?? 0}</h3>
                </div>
                <div className="bg-accent/10 border border-accent/20 p-2.5 rounded-lg text-accent">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="glass-panel border-border bg-bg-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Unique Visitors</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.uniqueVisitors ?? 0}</h3>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-lg text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="glass-panel border-border bg-bg-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Total Sessions</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.sessions ?? 0}</h3>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-lg text-purple-400">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </Card>

            <Card className="glass-panel border-border bg-bg-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Visitors Today</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.visitorsToday ?? 0}</h3>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* Visitors Over Time Chart */}
          <Card className="glass-panel border-border shadow-card p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-accent" /> Traffic &amp; Page Views Over Time ({selectedProject})
            </h3>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.visitorsOverTime || []}>
                  <defs>
                    <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#3B82F6" strokeWidth={2} fill="url(#pvGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Multi-Site Applications & External Projects Breakdown Table */}
          <Card className="glass-panel border-border shadow-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Multi-Site Applications &amp; Subdomains Traffic Breakdown
              </h3>
              <span className="text-[10px] text-text-tertiary">Auto-registers new sites on first hit</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-text-tertiary font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Application Name</th>
                    <th className="py-3 px-4">Slug ID</th>
                    <th className="py-3 px-4 text-center">Sessions</th>
                    <th className="py-3 px-4 text-center">Page Views</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data?.visitorsByProject?.length ? (
                    data.visitorsByProject.map((proj) => (
                      <tr key={proj.slug} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          {proj.project}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-text-secondary">{proj.slug}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-cyan-400">{proj.sessions}</td>
                        <td className="py-3.5 px-4 text-center font-semibold text-accent">{proj.pageViews}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedProject(proj.slug)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                              selectedProject === proj.slug
                                ? 'bg-accent text-white'
                                : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {selectedProject === proj.slug ? 'Active Filter' : 'Filter View'}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-text-tertiary text-xs">
                        No external projects recorded yet. Send your first analytics payload to test.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Grid split: Top Pages & Top Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="glass-panel border-border shadow-card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> Top Visited Pages ({selectedProject})
              </h3>
              <div className="space-y-2">
                {data?.topPages?.length ? (
                  data.topPages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                      <span className="font-mono text-white truncate max-w-[280px]">{page.path}</span>
                      <span className="font-bold text-accent">{page.views} views</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-tertiary">No page view data recorded yet for {selectedProject}.</p>
                )}
              </div>
            </Card>

            {/* Top Referrers */}
            <Card className="glass-panel border-border shadow-card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> Top Referrers ({selectedProject})
              </h3>
              <div className="space-y-2">
                {data?.topReferrers?.length ? (
                  data.topReferrers.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                      <span className="font-mono text-white truncate max-w-[280px]">{ref.referrer}</span>
                      <span className="font-bold text-purple-400">{ref.count} visits</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-text-tertiary">Direct traffic or internal navigation.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Modal: Add Project */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" /> Register Ecosystem Project
              </h3>
              <button
                type="button"
                onClick={() => setIsAddProjectOpen(false)}
                className="text-zinc-400 hover:text-white text-xs font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Project Name *</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => {
                    setNewProjectName(e.target.value);
                    if (!newProjectSlug) {
                      setNewProjectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                    }
                  }}
                  placeholder="e.g. Toolkit"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Slug Identifier *</label>
                <input
                  type="text"
                  required
                  value={newProjectSlug}
                  onChange={(e) => setNewProjectSlug(e.target.value.toLowerCase())}
                  placeholder="e.g. toolkit"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent"
                />
                <p className="text-[10px] text-zinc-400">Must match NEXT_PUBLIC_ANALYTICS_PROJECT_ID in external app.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Domain URL (Optional)</label>
                <input
                  type="text"
                  value={newProjectDomain}
                  onChange={(e) => setNewProjectDomain(e.target.value)}
                  placeholder="e.g. toolkit.warishlabs.in"
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingProject}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
                >
                  {isCreatingProject ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isCreatingProject ? 'Creating...' : 'Register Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

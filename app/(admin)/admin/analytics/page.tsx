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

  const handleCopySetupPrompt = () => {
    const promptTemplate = `You are integrating this project into WarishLabs' existing centralized
analytics system. Do NOT create a new database or new schema — a shared
analytics service already exists.

1. Inspect this project's codebase (framework, routing, existing
   analytics/tracking code if any).
2. Add the WarishLabs analytics tracker client to this project the same
   way it's used in warishlabs-website: install the shared tracker script in the root layout or add the <script> snippet to document head.
3. Point the tracker at the existing central API endpoint:
   https://warishlabs.in/api/analytics/event
   Do not create a new endpoint or a new database for this.
4. Add the required environment variable(s) to this project:
   NEXT_PUBLIC_ANALYTICS_API_URL=https://warishlabs.in/api/analytics/event
   NEXT_PUBLIC_ANALYTICS_PROJECT_ID=<YOUR_PROJECT_SLUG>
5. This project must be registered as a known project in the central
   \`projects\` table before events will be accepted (unregistered project
   identifiers are rejected). Registration happens via the WarishLabs
   admin panel or a POST to https://warishlabs.in/api/admin/analytics/register.
6. Run this project's build/lint/tests and confirm nothing else broke.
7. Do all of this on a new branch, do not push to main, open a PR.

At the very end, tell the user exactly what they must do manually,
clearly separated as:
"You need to do these manually:" — e.g. add the env var to this
project's Vercel settings (Production/Preview/Development as
appropriate) and redeploy, then register the project in the WarishLabs
admin panel.
"Antigravity has already handled these automatically:" — e.g. adding the
tracker client code, wiring the API call, updating .env.example.`;

    navigator.clipboard.writeText(promptTemplate);
    setCopied(true);
    toast.success('Analytics integration prompt copied to clipboard!');
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
            {/* Copy Setup Prompt Button */}
            <button
              onClick={handleCopySetupPrompt}
              className="px-3 py-1.5 bg-accent/10 border border-accent/30 hover:border-accent text-accent hover:text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Prompt Copied!' : 'Copy Setup Prompt for New Project'}
            </button>

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
            Real-time multi-site visitor telemetry powered by Neon PostgreSQL and Upstash Redis.
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
              <BarChart2 className="w-4 h-4 text-accent" /> Traffic & Page Views Over Time
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

          {/* Grid split: Top Pages & Top Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <Card className="glass-panel border-border shadow-card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" /> Top Visited Pages
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
                  <p className="text-xs text-text-tertiary">No page view data recorded yet.</p>
                )}
              </div>
            </Card>

            {/* Top Referrers */}
            <Card className="glass-panel border-border shadow-card p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" /> Top Referrers
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
    </div>
  );
}

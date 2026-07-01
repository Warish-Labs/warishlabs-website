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
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AnalyticsData {
  totalEvents: number;
  eventCounts: Array<{ eventName: string; _count: { id: number } }>;
  referrers: Array<{ referrer: string | null; _count: { id: number } }>;
  recentEvents: Array<{
    id: string;
    eventName: string;
    eventData: any;
    url: string;
    referrer: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
  }>;
  viewsOverTime: Array<{ date: string; views: number }>;
  topSearches: Array<{ term: string; count: number }>;
}

// ---------------------------------------------------------------------------
// Custom Tooltip for Recharts
// ---------------------------------------------------------------------------
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-panel border border-white/10 bg-bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs">
      <p className="text-text-tertiary font-mono mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Referrer label helper
// ---------------------------------------------------------------------------
function getReferrerLabel(ref: string | null): string {
  if (!ref) return 'Direct / Unknown';
  const lower = ref.toLowerCase();
  if (lower.includes('google.com')) return 'Google Search';
  if (lower.includes('github.com')) return 'GitHub';
  if (lower.includes('linkedin.com')) return 'LinkedIn';
  if (lower.includes('t.co') || lower.includes('twitter.com') || lower.includes('x.com')) return 'X / Twitter';
  if (lower.includes('localhost') || lower.includes('127.0.0.1')) return 'Local Staging';
  try {
    return new URL(ref).hostname;
  } catch {
    return ref;
  }
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchAnalytics = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?range=${selectedRange}`);
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
    fetchAnalytics(range);
  }, [range]);

  const handleRangeChange = (r: string) => {
    if (r !== range) {
      setRange(r);
      setExpandedRow(null);
    }
  };

  const maxSearchCount = data?.topSearches?.[0]?.count || 1;
  const maxReferrerCount = data?.referrers?.[0]?._count?.id || 1;

  return (
    <div className="space-y-8 select-none">
      {/* Header with Range Filter */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <LineChartIcon className="w-4 h-4 text-accent" /> Analytics Dashboard
          </CardTitle>
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5 shrink-0 self-start sm:self-center">
            {(['7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                  range === r ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-text-secondary text-sm">
            Auditing application traffic, page views, and visitor events tracked by the rate-limited secure analytics proxy.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-tertiary text-xs">Loading analytics data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── KPI WIDGETS ─────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Events */}
            <Card className="glass-panel border-border bg-bg-secondary p-6 hover:border-accent/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Total Events</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.totalEvents ?? 0}</h3>
                </div>
                <div className="bg-accent/10 border border-accent/20 p-2.5 rounded-lg text-accent">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Page Views */}
            <Card className="glass-panel border-border bg-bg-secondary p-6 hover:border-accent/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Page Views</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {data?.eventCounts?.find((e) => e.eventName === 'page_view')?._count?.id ?? 0}
                  </h3>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-2.5 rounded-lg text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Product Views */}
            <Card className="glass-panel border-border bg-bg-secondary p-6 hover:border-accent/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Product Views</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {data?.eventCounts?.find((e) => e.eventName === 'product_view')?._count?.id ?? 0}
                  </h3>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Searches */}
            <Card className="glass-panel border-border bg-bg-secondary p-6 hover:border-accent/20 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Searches</p>
                  <h3 className="text-3xl font-black text-white mt-1">
                    {data?.eventCounts?.find((e) => e.eventName === 'search')?._count?.id ?? 0}
                  </h3>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-lg text-purple-400">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </div>

          {/* ── PAGE VIEWS OVER TIME (Area Chart) ───────────────────────────── */}
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <LineChartIcon className="w-4 h-4 text-accent" /> Page Views Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!data?.viewsOverTime?.length || data.viewsOverTime.every((d) => d.views === 0) ? (
                <div className="py-12 text-center text-text-tertiary text-xs">
                  No page view data available for this range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.viewsOverTime} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="views"
                      name="Page Views"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      fill="url(#viewsGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: 'hsl(var(--accent))' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* ── REFERRERS + TOP SEARCHES ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Referrer Channels */}
            <div className="lg:col-span-5">
              <Card className="glass-panel border-border shadow-card overflow-hidden h-full">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-accent" /> Referrer Channels
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!data?.referrers?.length ? (
                    <div className="py-8 text-center text-text-tertiary text-xs">
                      No referral data available for this range.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.referrers.map((ref, idx) => {
                        const count = ref._count?.id || 0;
                        const pct = maxReferrerCount > 0 ? Math.round((count / maxReferrerCount) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-300 truncate max-w-[200px]" title={ref.referrer || ''}>
                                {getReferrerLabel(ref.referrer)}
                              </span>
                              <span className="text-text-secondary font-mono shrink-0 ml-2">{count}</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Search Terms (Bar Chart) */}
            <div className="lg:col-span-7">
              <Card className="glass-panel border-border shadow-card overflow-hidden h-full">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Search className="w-4 h-4 text-accent" /> Top Search Queries
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {!data?.topSearches?.length ? (
                    <div className="py-8 text-center text-text-tertiary text-xs">
                      No search data recorded for this range.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={data.topSearches}
                        layout="vertical"
                        margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: '#6b7280', fontSize: 9 }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="term"
                          tick={{ fill: '#9ca3af', fontSize: 9 }}
                          tickLine={false}
                          axisLine={false}
                          width={90}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="count"
                          name="Searches"
                          fill="hsl(var(--accent))"
                          radius={[0, 3, 3, 0]}
                          maxBarSize={16}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── EVENT BREAKDOWN BAR CHART ────────────────────────────────────── */}
          {data?.eventCounts && data.eventCounts.length > 0 && (
            <Card className="glass-panel border-border shadow-card overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-accent" /> Event Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={data.eventCounts.map((e) => ({ name: e.eventName.replace(/_/g, ' '), count: e._count.id }))}
                    margin={{ top: 0, right: 10, bottom: 20, left: -20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-30}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fill: '#6b7280', fontSize: 9 }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Events" fill="hsl(var(--accent))" radius={[3, 3, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* ── RECENT EVENT STREAMS (Expandable) ────────────────────────────── */}
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">
                Recent Event Streams <span className="text-text-tertiary font-normal text-xs">(Last 100)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              {!data?.recentEvents?.length ? (
                <div className="py-12 text-center text-text-tertiary text-sm">
                  No tracking events recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                        <th className="px-6 py-3 w-8" />
                        <th className="px-6 py-3">Event</th>
                        <th className="px-6 py-3">URL / Payload</th>
                        <th className="px-6 py-3">Source</th>
                        <th className="px-6 py-3">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                      {data.recentEvents.map((evt) => {
                        const isExpanded = expandedRow === evt.id;
                        return (
                          <React.Fragment key={evt.id}>
                            <tr
                              className="hover:bg-bg-card/30 transition-colors cursor-pointer"
                              onClick={() => setExpandedRow(isExpanded ? null : evt.id)}
                            >
                              <td className="px-4 py-4 text-text-tertiary">
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-accent-subtle/50 text-accent border border-accent/10 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                                  {evt.eventName}
                                </span>
                              </td>
                              <td className="px-6 py-4 max-w-xs">
                                <p className="text-white truncate text-xs" title={evt.url}>
                                  {evt.url}
                                </p>
                                {evt.eventData && (
                                  <p className="text-[10px] text-text-tertiary truncate">
                                    {JSON.stringify(evt.eventData)}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 max-w-[150px]">
                                <p className="text-xs text-text-secondary truncate" title={evt.referrer || 'Direct'}>
                                  {getReferrerLabel(evt.referrer)}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-xs">
                                <span className="flex items-center gap-1.5 text-text-tertiary whitespace-nowrap">
                                  <Clock className="w-3.5 h-3.5 shrink-0" />
                                  {formatDate(evt.createdAt, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-black/30">
                                <td colSpan={5} className="px-8 py-4">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Full URL</p>
                                      <p className="text-white font-mono break-all">{evt.url || '—'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">IP Address</p>
                                      <p className="text-white font-mono">{evt.ipAddress || 'Not recorded'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Referrer</p>
                                      <p className="text-white font-mono break-all">{evt.referrer || 'Direct / None'}</p>
                                    </div>
                                    {evt.eventData && (
                                      <div className="sm:col-span-2 md:col-span-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">Event Payload</p>
                                        <pre className="text-accent font-mono text-[10px] bg-black/40 border border-white/5 rounded p-3 overflow-x-auto">
                                          {JSON.stringify(evt.eventData, null, 2)}
                                        </pre>
                                      </div>
                                    )}
                                    {evt.userAgent && (
                                      <div className="sm:col-span-2 md:col-span-3">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">User Agent</p>
                                        <p className="text-white font-mono text-[10px] break-all">{evt.userAgent}</p>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

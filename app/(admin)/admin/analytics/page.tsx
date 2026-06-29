'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, BarChart2, Globe, Clock, Compass, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');

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
    } catch (err) {
      toast.error('Network error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  // Categorize a raw referrer string into a user-friendly label
  const getReferrerLabel = (ref: string | null) => {
    if (!ref) return 'Direct / Unknown';
    const lower = ref.toLowerCase();
    if (lower.includes('google.com')) return 'Google Search';
    if (lower.includes('github.com')) return 'GitHub Repo';
    if (lower.includes('linkedin.com')) return 'LinkedIn Referral';
    if (lower.includes('t.co') || lower.includes('twitter.com') || lower.includes('x.com')) return 'X / Twitter';
    if (lower.includes('localhost') || lower.includes('127.0.0.1')) return 'Local Staging';
    
    // Extract hostname
    try {
      const url = new URL(ref);
      return url.hostname;
    } catch {
      return ref;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Overview Card with Date Selector */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <LineChart className="w-4 h-4 text-accent" /> System Analytics & Traffic Logs
          </CardTitle>
          <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5 shrink-0 self-start sm:self-center">
            <button
              onClick={() => setRange('7d')}
              className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                range === '7d' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRange('30d')}
              className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                range === '30d' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setRange('all')}
              className={`px-3 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                range === 'all' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Auditing application traffic, page views, and visitor events tracked by the rate-limited secure analytics proxy.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-panel border-border bg-bg-secondary p-6 hover:border-accent/15 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Total Segment Events</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.totalEvents || 0}</h3>
                </div>
                <div className="bg-accent/10 border border-accent/20 p-2.5 rounded-lg text-accent">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {data?.eventCounts?.map((evt: any, idx: number) => (
              <Card key={idx} className="glass-panel border-border bg-bg-secondary p-6 hover:border-accent/15 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                      Event: {evt.eventName}
                    </p>
                    <h3 className="text-3xl font-black text-white mt-1">{evt._count?.id || 0}</h3>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 p-2.5 rounded-lg text-accent">
                    <Globe className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Traffic Sources list */}
            <div className="lg:col-span-4">
              <Card className="glass-panel border-border shadow-card overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-accent" /> Referrer Channels
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {(!data?.referrers || data.referrers.length === 0) ? (
                    <div className="py-6 text-center text-text-tertiary text-xs">
                      No referral data available for this range.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {data.referrers.map((ref: any, idx: number) => {
                        const count = ref._count?.id || 0;
                        const pct = data.totalEvents > 0 ? Math.round((count / data.totalEvents) * 100) : 0;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-zinc-300 truncate max-w-[180px]" title={ref.referrer}>
                                {getReferrerLabel(ref.referrer)}
                              </span>
                              <span className="text-text-secondary font-mono">{count} ({pct}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full" 
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

            {/* Events Log list */}
            <div className="lg:col-span-8">
              <Card className="glass-panel border-border shadow-card overflow-hidden">
                <CardHeader className="border-b border-border/40 pb-4">
                  <CardTitle className="text-sm font-semibold text-white">Recent Event Streams (Last 100)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-0">
                  {data?.recentEvents?.length === 0 ? (
                    <div className="py-12 text-center text-text-tertiary text-sm">
                      No tracking events recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                            <th className="px-6 py-3">Event Name</th>
                            <th className="px-6 py-3">URL / Details</th>
                            <th className="px-6 py-3">Referrer</th>
                            <th className="px-6 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                          {data?.recentEvents?.map((evt: any) => (
                            <tr key={evt.id} className="hover:bg-bg-card/30 transition-colors">
                              <td className="px-6 py-4">
                                <span className="bg-accent-subtle/50 text-accent border border-accent/10 px-2 py-0.5 rounded text-xs font-semibold">
                                  {evt.eventName}
                                </span>
                              </td>
                              <td className="px-6 py-4 max-w-xs truncate">
                                <p className="text-white truncate" title={evt.url}>{evt.url}</p>
                                {evt.eventData && (
                                  <p className="text-[10px] text-text-tertiary truncate">
                                    {JSON.stringify(evt.eventData)}
                                  </p>
                                )}
                              </td>
                              <td className="px-6 py-4 max-w-[150px] truncate">
                                <p className="text-xs text-text-secondary truncate" title={evt.referrer || 'Direct'}>
                                  {getReferrerLabel(evt.referrer)}
                                </p>
                              </td>
                              <td className="px-6 py-4 text-xs font-medium">
                                <span className="flex items-center gap-1.5 text-text-tertiary">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDate(evt.createdAt, {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

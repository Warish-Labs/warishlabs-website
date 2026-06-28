'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, BarChart2, Globe, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
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
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8 select-none">
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <LineChart className="w-4 h-4 text-accent" /> System Analytics & Traffic Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Auditing application traffic, page views, and visitor events tracked by the rate-limited secure analytics proxy.
          </p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="glass-panel border-border bg-bg-secondary p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-text-tertiary tracking-wider">Total Tracked Events</p>
                  <h3 className="text-3xl font-black text-white mt-1">{data?.totalEvents || 0}</h3>
                </div>
                <div className="bg-accent/10 border border-accent/20 p-2.5 rounded-lg text-accent">
                  <BarChart2 className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {data?.eventCounts?.map((evt: any, idx: number) => (
              <Card key={idx} className="glass-panel border-border bg-bg-secondary p-6">
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

          {/* Events Log */}
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
                        <th className="px-6 py-3">Visitor Session</th>
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
                          <td className="px-6 py-4 max-w-md truncate">
                            <p className="text-white truncate" title={evt.url}>{evt.url}</p>
                            {evt.eventData && (
                              <p className="text-[10px] text-text-tertiary truncate">
                                {JSON.stringify(evt.eventData)}
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-mono text-text-tertiary truncate max-w-[120px]">
                              {evt.visitorId || 'Anonymous'}
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
      )}
    </div>
  );
}

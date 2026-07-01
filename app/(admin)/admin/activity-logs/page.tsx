'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, Clock, User, ChevronDown, ChevronUp, Loader2, Monitor, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: {
    name: string | null;
    email: string;
  } | null;
}

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        toast.error(data.error || 'Failed to fetch activity logs');
      }
    } catch {
      toast.error('Network error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <History className="w-4 h-4 text-accent" /> System Activity Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Review historical modifications made to layout settings, categories, products, blog items, and media uploads.
            Click any row to expand full context, IP address, and user agent.
          </p>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">System Trail Logs</CardTitle>
          <span className="bg-accent-subtle/50 text-accent border border-accent/15 px-3 py-1 rounded-full text-xs font-bold">
            {logs.length} entries
          </span>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 text-accent animate-spin" />
              <p className="text-text-tertiary text-xs">Loading audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-text-tertiary text-sm">
              No logged activities recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                    <th className="px-4 py-3 w-8" />
                    <th className="px-6 py-3">Administrator</th>
                    <th className="px-6 py-3">Action Type</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                  {logs.map((log) => {
                    const isExpanded = expandedRow === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        {/* Main row (clickable) */}
                        <tr
                          className="hover:bg-bg-card/30 transition-colors cursor-pointer"
                          onClick={() => toggleRow(log.id)}
                        >
                          <td className="px-4 py-4 text-text-tertiary">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-white">
                              <User className="w-3.5 h-3.5 text-text-tertiary" />
                              <span className="font-semibold">{log.admin?.name || 'Clerk User'}</span>
                            </div>
                            <span className="text-[10px] text-text-tertiary block mt-0.5 ml-5">
                              {log.admin?.email}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-bg-card text-white border border-border px-2.5 py-1 rounded text-xs font-mono font-bold whitespace-nowrap">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-text-secondary max-w-sm truncate" title={log.details || ''}>
                            {log.details || <span className="text-text-tertiary italic">No details</span>}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className="flex items-center gap-1 text-text-tertiary whitespace-nowrap">
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              {formatDate(log.createdAt, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                        </tr>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <tr className="bg-black/30">
                            <td colSpan={5} className="px-8 py-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
                                {/* Full Details */}
                                <div className="md:col-span-3">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">
                                    Full Description
                                  </p>
                                  <p className="text-white font-mono leading-relaxed">
                                    {log.details || '—'}
                                  </p>
                                </div>

                                {/* IP Address */}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> IP Address
                                  </p>
                                  <p className="text-white font-mono">
                                    {log.ipAddress || 'Not recorded'}
                                  </p>
                                </div>

                                {/* Action */}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">
                                    Action Code
                                  </p>
                                  <p className="text-accent font-mono font-bold">{log.action}</p>
                                </div>

                                {/* Timestamp */}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1">
                                    Exact Timestamp
                                  </p>
                                  <p className="text-white font-mono">
                                    {new Date(log.createdAt).toISOString()}
                                  </p>
                                </div>

                                {/* User Agent */}
                                {log.userAgent && (
                                  <div className="md:col-span-3">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary mb-1 flex items-center gap-1">
                                      <Monitor className="w-3 h-3" /> User Agent
                                    </p>
                                    <p className="text-white font-mono text-[10px] break-all leading-relaxed">
                                      {log.userAgent}
                                    </p>
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
  );
}

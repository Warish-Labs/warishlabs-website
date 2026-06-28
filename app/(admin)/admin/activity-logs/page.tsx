'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { History, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/activity-logs');
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        toast.error(data.error || 'Failed to fetch activity logs');
      }
    } catch (err) {
      toast.error('Network error fetching logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 select-none">
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <History className="w-4 h-4 text-accent" /> System Activity Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Review historical modifications made to layout settings, categories, products, blog items, and media uploads.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-semibold text-white">System Trail Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
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
                    <th className="px-6 py-3">Administrator</th>
                    <th className="px-6 py-3">Action Type</th>
                    <th className="px-6 py-3">Description / Metadata</th>
                    <th className="px-6 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-bg-card/30 transition-colors">
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
                        <span className="bg-bg-card text-white border border-border px-2.5 py-1 rounded text-xs font-mono font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {log.details || <span className="text-text-tertiary italic">No details</span>}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="flex items-center gap-1 text-text-tertiary">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(log.createdAt, {
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
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch('/api/admin/newsletter');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        toast.error(data.error || 'Failed to fetch subscribers');
      }
    } catch (err) {
      toast.error('Network error fetching subscribers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;

    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Subscriber removed');
        fetchSubscribers();
      } else {
        toast.error(data.error || 'Failed to remove subscriber');
      }
    } catch (err) {
      toast.error('Network error deleting subscriber');
    }
  };

  return (
    <div className="space-y-8 select-none">
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent" /> Newsletter Subscribers
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Auditing newsletter list subscriptions. Subscribers are registered dynamically from the landing footer email submissions.
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-white">Registered Audiences</CardTitle>
          <span className="bg-accent-subtle/50 text-accent border border-accent/15 px-3 py-1 rounded-full text-xs font-bold">
            Total: {subscribers.length}
          </span>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="py-12 text-center text-text-tertiary text-sm">
              No registered email subscribers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Registered Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                  {subscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-bg-card/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {sub.email}
                      </td>
                      <td className="px-6 py-4">
                        {formatDate(sub.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border ${
                          sub.active 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          {sub.active ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-destructive" /> Unsubscribed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors cursor-pointer inline-flex"
                          title="Remove Subscriber"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Trash2, CheckCircle, XCircle, Download, Send, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Campaign Composer Form states
  const [subject, setSubject] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isSending, setIsSending] = useState(false);

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

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.error('No audience data available for export');
      return;
    }
    
    const headers = ['ID', 'Email', 'Active', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map((sub) =>
        [
          sub.id,
          `"${sub.email}"`,
          sub.active ? 'TRUE' : 'FALSE',
          new Date(sub.createdAt).toISOString()
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `warishlabs_newsletter_subscribers_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Subscriber registry exported successfully to CSV');
  };

  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !htmlContent.trim()) {
      toast.error('Please specify both subject line and newsletter HTML content');
      return;
    }

    const activeCount = subscribers.filter((s) => s.active).length;
    if (activeCount === 0) {
      toast.error('No active subscribers available to receive this broadcast');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to dispatch this email broadcast? It will be sent to all ${activeCount} active subscribers immediately.`
      )
    ) {
      return;
    }

    setIsSending(true);
    try {
      const res = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, htmlContent }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Mailing campaign executed successfully');
        setSubject('');
        setHtmlContent('');
      } else {
        toast.error(data.error || 'Failed to dispatch broadcast');
      }
    } catch (err) {
      toast.error('Network error during broadcast dispatch');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Overview */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent" /> Newsletter Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Auditing subscriber audiences, composing dynamic campaign digests, and executing mail broadcast operations via Resend.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Campaign Composer Form */}
        <div className="lg:col-span-5">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Broadcast HTML Composer</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSendCampaign} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Subject Line</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Platform update: WebGL particle engine release"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">HTML Email Content</label>
                    <span className="text-[9px] text-text-tertiary font-mono">Supports HTML elements</span>
                  </div>
                  <textarea
                    required
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder={`<div style="font-family: sans-serif;">\n  <h2>Platform Update</h2>\n  <p>We just released new canvas utilities...</p>\n</div>`}
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-accent h-64 font-mono resize-none"
                  />
                </div>

                {subscribers.filter(s => s.active).length > 0 && (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      This operation will dispatch to all{' '}
                      <strong>{subscribers.filter(s => s.active).length} active</strong> recipients. Make sure to double-check HTML tags.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSending || subscribers.filter(s => s.active).length === 0}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSending ? 'Dispatching Broadcast...' : 'Execute Campaign'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Registered Audiences List */}
        <div className="lg:col-span-7">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Registered Audiences</CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={subscribers.length === 0}
                  className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-accent hover:text-white rounded text-[10px] font-bold uppercase text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Export Subscriber List to CSV"
                >
                  <Download className="w-3.5 h-3.5" /> Export (CSV)
                </button>
                <span className="bg-accent-subtle/50 text-accent border border-accent/15 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  Total: {subscribers.length}
                </span>
              </div>
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
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              sub.active 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                              {sub.active ? (
                                <>
                                  <CheckCircle className="w-3 h-3 text-emerald-400" /> Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-destructive" /> Opt-out
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
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFaqs = async () => {
    try {
      const res = await fetch('/api/admin/faqs');
      const data = await res.json();
      if (data.success) {
        setFaqs(data.faqs);
      } else {
        toast.error(data.error || 'Failed to fetch FAQs');
      }
    } catch (err) {
      toast.error('Network error fetching FAQs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, sortOrder, active }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('FAQ created successfully');
        setQuestion('');
        setAnswer('');
        setSortOrder(0);
        setActive(true);
        fetchFaqs();
      } else {
        toast.error(data.error || 'Failed to create FAQ');
      }
    } catch (err) {
      toast.error('Network error creating FAQ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('FAQ deleted successfully');
        fetchFaqs();
      } else {
        toast.error(data.error || 'Failed to delete FAQ');
      }
    } catch (err) {
      toast.error('Network error deleting FAQ');
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch('/api/admin/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.faq.active ? 'FAQ is active' : 'FAQ is hidden');
        fetchFaqs();
      } else {
        toast.error(data.error || 'Failed to update FAQ status');
      }
    } catch (err) {
      toast.error('Network error updating FAQ');
    }
  };

  return (
    <div className="space-y-8 select-none">
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-accent" /> FAQ Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Configure Frequently Asked Questions displayed on the dynamic homepage FAQ accordions.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-5">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Create New FAQ</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Question</label>
                  <input
                    type="text"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g. What is the SLA response guarantee?"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Answer</label>
                  <textarea
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Provide a detailed answer text"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent h-32 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Sort Order</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                      className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end pb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="active"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="rounded bg-bg-secondary border-border border text-accent focus:ring-accent"
                      />
                      <label htmlFor="active" className="text-xs font-semibold text-white select-none cursor-pointer">
                        Display publicly
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Creating...' : 'Create FAQ'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* FAQs List */}
        <div className="lg:col-span-7">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Public FAQs</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                </div>
              ) : faqs.length === 0 ? (
                <div className="py-12 text-center text-text-tertiary text-sm">
                  No FAQs found. Create one on the left.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                        <th className="px-6 py-3">Order / Question</th>
                        <th className="px-6 py-3">Answer</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                      {faqs.map((faq) => (
                        <tr key={faq.id} className="hover:bg-bg-card/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">#{faq.sortOrder}</p>
                            <p className="text-xs text-text-secondary font-medium max-w-xs truncate">{faq.question}</p>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            {faq.answer}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleActive(faq.id, faq.active)}
                              className={`px-2 py-0.5 rounded text-xs font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                                faq.active
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}
                            >
                              {faq.active ? (
                                <>
                                  <Eye className="w-3 h-3" /> Active
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Hidden
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleDelete(faq.id)}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors cursor-pointer inline-flex"
                              title="Delete FAQ"
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

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MailQuestion, Trash2, Check, Send, Loader2, CheckSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  // Reply States
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      } else {
        toast.error(data.error || 'Failed to fetch messages');
      }
    } catch (err) {
      toast.error('Network error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = (msg: any) => {
    setSelectedMessage(msg);
    setReplyText('');
    // Automatically mark as read if it is unread
    if (msg.status === 'unread') {
      handleToggleStatus(msg.id, 'unread', true);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, silent = false) => {
    const nextStatus = currentStatus === 'unread' ? 'read' : 'unread';
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        if (!silent) {
          toast.success(nextStatus === 'read' ? 'Marked as read' : 'Marked as unread');
        }
        fetchMessages();
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage({ ...selectedMessage, status: nextStatus });
        }
      } else if (!silent) {
        toast.error(data.error || 'Failed to update message status');
      }
    } catch (err) {
      if (!silent) {
        toast.error('Network error updating status');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Message deleted successfully');
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(null);
        }
        fetchMessages();
      } else {
        toast.error(data.error || 'Failed to delete message');
      }
    } catch (err) {
      toast.error('Network error deleting message');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch('/api/admin/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedMessage.id, replyText }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Reply email sent successfully');
        setReplyText('');
        fetchMessages();
        // Update local state to read as the backend automatically marks replied emails as read
        setSelectedMessage({ ...selectedMessage, status: 'read' });
      } else {
        toast.error(data.error || 'Failed to send reply');
      }
    } catch (err) {
      toast.error('Network error sending reply');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Page header */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <MailQuestion className="w-4 h-4 text-accent" /> Contact Form Inbound Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Read and review direct contact inquiries submitted from the public contact forms.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Messages List */}
        <div className={selectedMessage ? 'lg:col-span-7' : 'lg:col-span-12'}>
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Inbound Queue</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin h-6 w-6 text-accent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="py-20 text-center text-text-tertiary text-sm flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-bg-secondary flex items-center justify-center border border-border">
                    <MailQuestion className="w-6 h-6 text-text-tertiary opacity-60" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Inbox Clean</p>
                    <p className="text-xs text-text-tertiary mt-1">No inbound contact inquiries at this time.</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                        <th className="px-6 py-3">From</th>
                        <th className="px-6 py-3">Subject / Date</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs text-text-secondary">
                      {messages.map((msg) => (
                        <tr 
                          key={msg.id} 
                          className={`transition-colors cursor-pointer border-l-4 ${
                            selectedMessage?.id === msg.id 
                              ? 'bg-bg-card border-accent' 
                              : msg.status === 'unread' 
                              ? 'bg-accent-subtle/30 hover:bg-accent-subtle/50 border-accent font-semibold' 
                              : 'bg-transparent hover:bg-bg-card/30 border-transparent'
                          }`}
                          onClick={() => handleSelectMessage(msg)}
                        >
                          <td className="px-6 py-4">
                            <p className="text-white font-bold">{msg.name}</p>
                            <p className="text-[10px] text-text-tertiary mt-0.5">{msg.email}</p>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate">
                            <p className="text-white truncate font-medium">{msg.subject}</p>
                            <p className="text-[10px] text-text-tertiary mt-0.5">{formatDate(msg.createdAt)}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                              msg.status === 'unread' 
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {msg.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleStatus(msg.id, msg.status)}
                              className="text-text-secondary hover:bg-bg-card p-1.5 rounded transition-colors cursor-pointer inline-flex"
                              title={msg.status === 'unread' ? 'Mark as Read' : 'Mark as Unread'}
                            >
                              <Check className="w-4 h-4 text-zinc-400 hover:text-white" />
                            </button>
                            <button
                              onClick={() => handleDelete(msg.id)}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors cursor-pointer inline-flex"
                              title="Delete Message"
                            >
                              <Trash2 className="w-4 h-4 text-destructive/80 hover:text-destructive" />
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

        {/* Selected Message Detail Column */}
        {selectedMessage && (
          <div className="lg:col-span-5">
            <Card className="glass-panel border-border shadow-card overflow-hidden">
              <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold text-white">Message Details</CardTitle>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded bg-white/5 border border-white/10 hover:border-accent text-zinc-300 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Sender Profile</label>
                  <p className="text-sm font-bold text-white mt-1">{selectedMessage.name}</p>
                  <a href={`mailto:${selectedMessage.email}`} className="text-xs text-accent hover:underline block mt-0.5 font-medium">
                    {selectedMessage.email}
                  </a>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Subject & Date</label>
                  <p className="text-sm font-semibold text-white mt-1">{selectedMessage.subject}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{formatDate(selectedMessage.createdAt)}</p>
                </div>

                <div className="border-t border-border/40 pt-4">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Message Body</label>
                  <div className="bg-bg-secondary border border-border/45 rounded-lg p-4 text-sm text-text-secondary mt-2 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>

                {/* Reply Form */}
                <div className="border-t border-border/40 pt-4 space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Compose Email Reply</label>
                  {isReplying ? (
                    <div className="space-y-2 py-4 bg-bg-secondary/40 border border-border/20 rounded-md p-4 animate-pulse">
                      <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                      <div className="h-3 bg-zinc-800 rounded w-1/2"></div>
                      <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendReply} className="space-y-3">
                      <textarea
                        required
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type response back to sender..."
                        className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-accent h-28 resize-none"
                      />
                      <button
                        type="submit"
                        disabled={isReplying || !replyText.trim()}
                        className="w-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs uppercase tracking-wider py-2 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Reply
                      </button>
                    </form>
                  )}
                </div>

                {selectedMessage.status === 'unread' && (
                  <button
                    onClick={() => handleToggleStatus(selectedMessage.id, selectedMessage.status)}
                    className="w-full bg-zinc-900 border border-border hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold text-xs uppercase tracking-wider py-2 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-accent" />
                    Mark as read
                  </button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

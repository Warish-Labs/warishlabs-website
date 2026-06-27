'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, Plus, Edit2, Trash2, X, Terminal, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Lab {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  url: string | null;
}

export default function AdminLabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitPending, setIsSubmitPending] = useState(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [url, setUrl] = useState('');

  // Fetch initial data
  useEffect(() => {
    async function fetchLabs() {
      try {
        const response = await fetch('/api/admin/labs');
        const data = await response.json();
        if (data.success) setLabs(data.labs);
      } catch (err) {
        toast.error('Failed to load lab resources.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLabs();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStatus('active');
    setUrl('');
    setIsFormOpen(false);
  };

  const handleEditClick = (lab: Lab) => {
    setEditingId(lab.id);
    setName(lab.name);
    setDescription(lab.description);
    setStatus(lab.status);
    setUrl(lab.url || '');
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      toast.error('Please enter all required fields.');
      return;
    }

    setIsSubmitPending(true);
    const payload = {
      id: editingId,
      name,
      description,
      status,
      url: url || null,
    };

    try {
      const response = await fetch('/api/admin/labs', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(editingId ? 'Lab updated successfully!' : 'Lab created successfully!');
        
        // Refresh labs list
        const resLabs = await fetch('/api/admin/labs');
        const dataLabs = await resLabs.json();
        if (dataLabs.success) setLabs(dataLabs.labs);

        resetForm();
      } else {
        toast.error(result.error || 'Failed to submit lab.');
      }
    } catch (err) {
      toast.error('An error occurred during submission.');
    } finally {
      setIsSubmitPending(false);
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete experimental lab "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/labs?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Lab deleted successfully!');
        setLabs(labs.filter(l => l.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete lab.');
      }
    } catch (err) {
      toast.error('An error occurred during deletion.');
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="w-8 h-8 text-accent" />
            Manage Labs
          </h1>
          <p className="text-text-secondary text-sm">
            Configure raw interactive visuals and system prototypes in the experimental sandbox.
          </p>
        </div>
        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-accent hover:bg-accent-hover text-white active:scale-[0.97] transition-all font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Experiment
          </Button>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-secondary text-xs">Loading lab records...</p>
        </div>
      ) : isFormOpen ? (
        /* Edit/Create Form panel */
        <Card className="glass-panel border-border shadow-card relative overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-white tracking-wide uppercase">
              {editingId ? 'Edit Lab Experiment' : 'Construct New Experiment'}
            </CardTitle>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg border border-border bg-bg-card text-text-secondary hover:text-white hover:border-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lab Name */}
                <div className="space-y-2">
                  <Label htmlFor="lab-name" className="text-xs font-semibold text-text-secondary">
                    Experiment Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lab-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. GPU Instanced Starfields"
                    required
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Status select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary">
                    Sandbox Status <span className="text-destructive">*</span>
                  </Label>
                  <Select value={status} onValueChange={(val) => setStatus(val || 'active')}>
                    <SelectTrigger className="bg-bg-primary border-border text-white focus:border-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-card border-border text-white">
                      <SelectItem value="active">Active (WIP)</SelectItem>
                      <SelectItem value="completed">Completed (Stable)</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch/Demo URL */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lab-url" className="text-xs font-semibold text-text-secondary">
                    Live Demo URL (Optional)
                  </Label>
                  <Input
                    id="lab-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. https://particles.warishlabs.in"
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Description Textarea */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lab-desc" className="text-xs font-semibold text-text-secondary">
                    Experiment Summary <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="lab-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Briefly summarize what this prototype explores..."
                    required
                    className="bg-bg-primary border-border focus:border-accent text-white text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitPending}
                  className="border-border hover:bg-bg-card text-white cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitPending}
                  className="bg-accent hover:bg-accent-hover text-white active:scale-[0.97] transition-all font-semibold flex items-center gap-2 cursor-pointer shadow-accent"
                >
                  {isSubmitPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Save Experiment'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Labs List Grid */
        <Card className="glass-panel border-border shadow-card overflow-hidden">
          <CardContent className="p-0">
            {labs.length === 0 ? (
              <div className="text-center py-20 text-text-tertiary text-sm flex flex-col items-center gap-4">
                <Terminal className="w-12 h-12 text-text-tertiary opacity-40 animate-pulse" />
                <p>No lab experiments constructed in the database catalog.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-bg-secondary text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      <th className="px-6 py-4">Experiment Name</th>
                      <th className="px-6 py-4">Sandbox Status</th>
                      <th className="px-6 py-4">Live Demo Link</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-xs">
                    {labs.map((lab) => (
                      <tr key={lab.id} className="hover:bg-bg-card/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          <p>{lab.name}</p>
                          <span className="text-[10px] font-normal text-text-secondary leading-relaxed line-clamp-1 max-w-[280px]">
                            {lab.description}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                              lab.status === 'active'
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : lab.status === 'completed'
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-text-tertiary/10 border-border text-text-secondary"
                            )}
                          >
                            {lab.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-text-tertiary">
                          {lab.url ? (
                            <a
                              href={lab.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              Launch Demo <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(lab)}
                            className="border-border hover:border-accent hover:text-white p-2 h-8 w-8 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(lab.id, lab.name)}
                            className="border-border hover:border-destructive hover:text-destructive p-2 h-8 w-8 text-destructive/80 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

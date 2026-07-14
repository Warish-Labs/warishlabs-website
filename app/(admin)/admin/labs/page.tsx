'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FlaskConical, Plus, Edit2, Trash2, X, Terminal, Loader2, ExternalLink, Play, Image, Search } from 'lucide-react';
import Github from '@/components/icons/GithubIcon';
import { toast } from 'sonner';

interface Lab {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  type: string;
  url: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
  mediaUrl: string | null;
}

export default function AdminLabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitPending, setIsSubmitPending] = useState(false);
  
  // Search & Pagination State
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [type, setType] = useState('experiment');
  const [url, setUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isMediaUploading, setIsMediaUploading] = useState(false);

  const fetchLabs = async (query = '', pageNum = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/labs?search=${encodeURIComponent(query)}&page=${pageNum}`);
      const data = await response.json();
      if (data.success) {
        setLabs(data.labs);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      toast.error('Failed to load lab resources.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs(search, page);
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    fetchLabs(e.target.value, 1);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setStatus('active');
    setType('experiment');
    setUrl('');
    setGithubUrl('');
    setDemoUrl('');
    setMediaUrl('');
    setIsFormOpen(false);
  };

  const handleEditClick = (lab: Lab) => {
    setEditingId(lab.id);
    setName(lab.name);
    setDescription(lab.description);
    setStatus(lab.status);
    setType(lab.type || 'experiment');
    setUrl(lab.url || '');
    setGithubUrl(lab.githubUrl || '');
    setDemoUrl(lab.demoUrl || '');
    setMediaUrl(lab.mediaUrl || '');
    setIsFormOpen(true);
  };

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size exceeds maximum limit of 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, and WebP are accepted.');
      return;
    }

    setIsMediaUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'labs');

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.asset) {
        setMediaUrl(data.asset.url);
        toast.success('Screenshot uploaded successfully');
      } else {
        toast.error(data.error || 'Failed to upload screenshot');
      }
    } catch (err) {
      toast.error('Network error uploading screenshot');
    } finally {
      setIsMediaUploading(false);
    }
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
      type,
      url: url || null,
      githubUrl: githubUrl || null,
      demoUrl: demoUrl || null,
      mediaUrl: mediaUrl || null,
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
        fetchLabs(search, page);
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
        fetchLabs(search, page);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FlaskConical className="w-8 h-8 text-accent" />
            Manage Labs
          </h1>
          <p className="text-text-secondary text-sm">
            Configure raw interactive visuals and system prototypes in the experimental sandbox.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isFormOpen && (
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search experiments..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 bg-bg-primary border-border focus:border-accent text-white"
              />
            </div>
          )}
          {!isFormOpen && (
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white active:scale-[0.97] transition-all font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Experiment
            </Button>
          )}
        </div>
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
                    Experiment Title / Name <span className="text-destructive">*</span>
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

                {/* Type select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary">
                    Sandbox Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={type} onValueChange={(val) => setType(val || 'experiment')}>
                    <SelectTrigger className="bg-bg-primary border-border text-white focus:border-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-card border-border text-white">
                      <SelectItem value="experiment">Experiment</SelectItem>
                      <SelectItem value="tool">Utility Tool</SelectItem>
                      <SelectItem value="sandbox">Sandbox Canvas</SelectItem>
                      <SelectItem value="prototype">Prototype Build</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Launch/Demo URL */}
                <div className="space-y-2">
                  <Label htmlFor="lab-url" className="text-xs font-semibold text-text-secondary">
                    Live URL (Optional)
                  </Label>
                  <Input
                    id="lab-url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. https://particles.warishlabs.in"
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Repository URL */}
                <div className="space-y-2">
                  <Label htmlFor="lab-repo" className="text-xs font-semibold text-text-secondary">
                    Repository URL (Optional)
                  </Label>
                  <Input
                    id="lab-repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="e.g. https://github.com/warishlabs/starfield"
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Demo Video URL */}
                <div className="space-y-2">
                  <Label htmlFor="lab-demo" className="text-xs font-semibold text-text-secondary">
                    Demo Video URL (Optional)
                  </Label>
                  <Input
                    id="lab-demo"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    placeholder="e.g. https://youtube.com/watch?v=..."
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Media Screenshot Upload */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lab-media-file" className="text-xs font-semibold text-text-secondary">
                    Media Screenshot / Cover (Optional)
                  </Label>
                  <div className="flex items-center gap-3">
                    {mediaUrl ? (
                      <div className="w-16 h-10 rounded border border-border bg-bg-card flex items-center justify-center overflow-hidden shrink-0 relative group">
                        <img src={mediaUrl} alt="Screenshot preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setMediaUrl('')}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] transition-opacity font-bold uppercase cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded border border-dashed border-border flex items-center justify-center shrink-0">
                        <span className="text-[9px] text-text-tertiary font-mono">No Image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="lab-media-file"
                        type="file"
                        accept="image/*"
                        onChange={handleMediaUpload}
                        disabled={isMediaUploading}
                        className="bg-bg-primary border-border focus:border-accent text-white text-xs file:bg-bg-card file:border-border file:text-white file:rounded file:px-2 file:py-0.5 file:mr-2 file:cursor-pointer"
                      />
                      <p className="text-[9px] text-text-tertiary mt-1">Recommended: 1200×630px, max 5MB. JPG, PNG, or WebP</p>
                    </div>
                  </div>
                  {isMediaUploading && <p className="text-[10px] text-accent animate-pulse">Uploading screenshot to Cloudinary...</p>}
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
                <p>No lab experiments constructed matching criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-bg-secondary text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      <th className="px-6 py-4">Experiment Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Sandbox Status</th>
                      <th className="px-6 py-4">Resources</th>
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
                        <td className="px-6 py-4 capitalize text-text-secondary font-mono">
                          {lab.type}
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
                        <td className="px-6 py-4 text-text-tertiary flex gap-3 items-center mt-1">
                          {lab.url && (
                            <a
                              href={lab.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline flex items-center gap-1"
                              title="Launch Lab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lab.githubUrl && (
                            <a
                              href={lab.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-accent flex items-center gap-1"
                              title="GitHub Code"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lab.demoUrl && (
                            <a
                              href={lab.demoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-400 hover:text-accent flex items-center gap-1"
                              title="Watch Demo"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {lab.mediaUrl && (
                            <a
                              href={lab.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-zinc-500 hover:text-accent flex items-center gap-1"
                              title="Screenshot"
                            >
                              <Image className="w-3.5 h-3.5" />
                            </a>
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
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-bg-secondary/20">
                <span className="text-xs text-text-secondary font-mono">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-border text-white hover:bg-bg-card text-xs font-semibold"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-border text-white hover:bg-bg-card text-xs font-semibold"
                  >
                    Next
                  </Button>
                </div>
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

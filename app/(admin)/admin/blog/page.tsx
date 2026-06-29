'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Plus, Trash2, Eye, EyeOff, Edit, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible SEO Panel states
  const [showSeo, setShowSeo] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blog');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.error || 'Failed to fetch blogs');
      }
    } catch (err) {
      toast.error('Network error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleEditClick = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setCategory(blog.category);
    setPublished(blog.published);
    setCoverImage(blog.coverImage || '');
    
    // Populate SEO values if they exist
    if (blog.seo) {
      setSeoTitle(blog.seo.title || '');
      setSeoDescription(blog.seo.description || '');
      setSeoKeywords(blog.seo.keywords || '');
    } else {
      setSeoTitle('');
      setSeoDescription('');
      setSeoKeywords('');
    }
    
    // Auto-expand SEO panel if edited blog has custom SEO metadata
    setShowSeo(!!blog.seo);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory('Engineering');
    setPublished(false);
    setCoverImage('');
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setShowSeo(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !excerpt.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      id: editingId,
      title,
      content,
      excerpt,
      category,
      published,
      coverImage: coverImage || 'https://res.cloudinary.com/placeholder.jpg',
      seo: {
        title: seoTitle || title,
        description: seoDescription || excerpt,
        keywords: seoKeywords,
      }
    };

    try {
      const res = await fetch('/api/admin/blog', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Blog article updated successfully' : 'Blog article created successfully');
        resetForm();
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to submit article');
      }
    } catch (err) {
      toast.error('Network error submitting article');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Article deleted successfully');
        if (editingId === id) resetForm();
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to delete article');
      }
    } catch (err) {
      toast.error('Network error deleting article');
    }
  };

  const togglePublish = async (id: string, currentPublished: boolean) => {
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, published: !currentPublished }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.blog.published ? 'Article published' : 'Article unpublished');
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to update publishing status');
      }
    } catch (err) {
      toast.error('Network error updating article');
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Overview Card */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" /> Blog Articles
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Publish engineering briefs, release logs, and research articles. Articles are displayed on the public lab `/blog` portal.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create / Edit Form */}
        <div className="lg:col-span-5">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">
                {editingId ? 'Edit Article Build' : 'Write New Article'}
              </CardTitle>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-1 rounded bg-white/5 border border-white/10 hover:border-accent text-zinc-300 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Article Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scaling Real-Time WebGL Particle Physics"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Category & Cover Image */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Research">Research</option>
                      <option value="Security">Security</option>
                      <option value="Design">Design</option>
                      <option value="Changelog">Changelog</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Cover Image URL</label>
                    <input
                      type="text"
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="res.cloudinary.com/..."
                      className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Excerpt Summary</label>
                  <textarea
                    required
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Provide a short sentence summarizing the post"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent h-16 resize-none"
                  />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Content (Markdown supported)</label>
                  <textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="# Hello World \n\n Write article contents here..."
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent h-40 resize-none font-mono"
                  />
                </div>

                {/* Collapsible SEO Panel */}
                <div className="border border-white/5 bg-black/20 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowSeo(!showSeo)}
                    className="w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-300"
                  >
                    <span>Collapsible SEO Metadata Settings</span>
                    {showSeo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {showSeo && (
                    <div className="p-4 space-y-3 border-t border-white/5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Meta Title</label>
                        <input
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="If left empty, defaults to article title"
                          className="w-full bg-bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Meta Description</label>
                        <textarea
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="If left empty, defaults to excerpt summary"
                          className="w-full bg-bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent h-16 resize-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Meta Keywords</label>
                        <input
                          type="text"
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="comma, separated, tags"
                          className="w-full bg-bg-secondary border border-border rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Publish Immediately */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded bg-bg-secondary border-border border text-accent focus:ring-accent"
                  />
                  <label htmlFor="published" className="text-xs font-semibold text-white select-none cursor-pointer">
                    Publish immediately (Make visible on site)
                  </label>
                </div>

                {/* Actions */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Submitting...' : editingId ? 'Update Article' : 'Create Article'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Articles List */}
        <div className="lg:col-span-7">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Articles Catalog</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              {loading ? (
                <div className="px-6 py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                </div>
              ) : blogs.length === 0 ? (
                <div className="px-6 py-12 text-center text-text-tertiary text-sm">
                  No articles found. Write one on the left.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                        <th className="px-6 py-3">Title / Date</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                      {blogs.map((blog) => (
                        <tr key={blog.id} className="hover:bg-bg-card/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white max-w-xs truncate">{blog.title}</p>
                            <p className="text-[10px] text-text-tertiary">
                              {formatDate(blog.createdAt)}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-accent-subtle/50 text-accent border border-accent/10 px-2 py-0.5 rounded text-xs font-semibold">
                              {blog.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => togglePublish(blog.id, blog.published)}
                              className={`px-2 py-0.5 rounded text-xs font-semibold border flex items-center gap-1 cursor-pointer transition-colors ${
                                blog.published
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              }`}
                            >
                              {blog.published ? (
                                <>
                                  <Eye className="w-3 h-3" /> Published
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Draft
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(blog)}
                              className="border-border hover:border-accent hover:text-white p-2 h-8 w-8 cursor-pointer inline-flex"
                              title="Edit Article"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(blog.id)}
                              className="border-border hover:border-destructive hover:text-destructive p-2 h-8 w-8 text-destructive/80 cursor-pointer inline-flex"
                              title="Delete Article"
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
        </div>
      </div>
    </div>
  );
}

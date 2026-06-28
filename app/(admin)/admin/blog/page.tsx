'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Plus, Trash2, Eye, EyeOff, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !excerpt.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          category,
          published,
          coverImage: coverImage || 'https://res.cloudinary.com/placeholder.jpg',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Blog article created successfully');
        setTitle('');
        setExcerpt('');
        setContent('');
        setCategory('Engineering');
        setPublished(false);
        setCoverImage('');
        fetchBlogs();
      } else {
        toast.error(data.error || 'Failed to create blog');
      }
    } catch (err) {
      toast.error('Network error creating blog');
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
        {/* Create Form */}
        <div className="lg:col-span-5">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Write New Article</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreate} className="space-y-4">
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

                <div className="flex items-center gap-2">
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Creating...' : 'Create Article'}
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
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors cursor-pointer inline-flex"
                              title="Delete Article"
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

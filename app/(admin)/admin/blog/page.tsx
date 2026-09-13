'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Plus, Trash2, Eye, EyeOff, Edit, X, ChevronDown, ChevronUp, Search, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/utils/formatters';
import { Button } from '@/components/ui/button';
import { BlogCoverImageField } from '@/components/admin/BlogCoverImageField';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { renderMarkdown } from '@/lib/markdown';

interface Category {
  id: string;
  name: string;
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Pagination, Filter states
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [contentFormat, setContentFormat] = useState<'markdown' | 'html'>('markdown');
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [category, setCategory] = useState('Engineering');
  const [published, setPublished] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [coverImageWidth, setCoverImageWidth] = useState<number | undefined>(undefined);
  const [coverImageHeight, setCoverImageHeight] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Collapsible SEO Panel states
  const [showSeo, setShowSeo] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const fetchBlogs = async (query = '', cat = 'all', pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blog?search=${encodeURIComponent(query)}&category=${encodeURIComponent(cat)}&page=${pageNum}`);
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      } else {
        toast.error(data.error || 'Failed to fetch blogs');
      }
    } catch (err) {
      toast.error('Network error fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
        if (data.categories.length > 0 && !category) {
          setCategory(data.categories[0].name);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBlogs(search, filterCategory, page);
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    fetchBlogs(e.target.value, filterCategory, 1);
  };

  const handleEditClick = (blog: any) => {
    setEditingId(blog.id);
    setTitle(blog.title);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setCategory(blog.category);
    setPublished(blog.published);
    setCoverImage(blog.coverImage || '');
    setCoverImageWidth(blog.coverImageWidth ?? undefined);
    setCoverImageHeight(blog.coverImageHeight ?? undefined);
    
    if (blog.seo) {
      setSeoTitle(blog.seo.title || '');
      setSeoDescription(blog.seo.description || '');
      setSeoKeywords(blog.seo.keywords || '');
    } else {
      setSeoTitle('');
      setSeoDescription('');
      setSeoKeywords('');
    }
    
    setShowSeo(!!blog.seo);
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setCategory(categories[0]?.name || 'Engineering');
    setPublished(false);
    setCoverImage('');
    setCoverImageWidth(undefined);
    setCoverImageHeight(undefined);
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setShowSeo(false);
    setIsFormOpen(false);
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
      coverImage: coverImage || null,
      coverImageWidth: coverImageWidth ?? null,
      coverImageHeight: coverImageHeight ?? null,
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
        fetchBlogs(search, filterCategory, page);
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
        fetchBlogs(search, filterCategory, page);
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
        fetchBlogs(search, filterCategory, page);
      } else {
        toast.error(data.error || 'Failed to update publishing status');
      }
    } catch (err) {
      toast.error('Network error updating article');
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-accent" />
            Manage Blog Articles
          </h1>
          <p className="text-text-secondary text-sm">
            Publish guides, how-to articles, and product announcements.
          </p>
        </div>
        {!isFormOpen && (
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search articles..."
                value={search}
                onChange={handleSearchChange}
                className="pl-9 bg-bg-primary border-border focus:border-accent text-white"
              />
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-accent hover:bg-accent-hover text-white font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Article
            </Button>
          </div>
        )}
      </div>

      {/* Form Panel (Dedicated Upper Section) */}
      {isFormOpen && (
        <Card className="glass-panel border-border shadow-card overflow-hidden">
          <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-white tracking-wide uppercase">
              {editingId ? 'Edit Blog Article' : 'Write New Article'}
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
                {/* Title */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-text-secondary">Article Title *</Label>
                  <Input
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Why Project State Beats Chat History in Agentic AI Systems"
                    className="bg-bg-primary border-border text-white"
                  />
                </div>

                {/* Category Select (Shared source) */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary">Category *</Label>
                  <Select value={category} onValueChange={(val) => setCategory(val || 'Engineering')}>
                    <SelectTrigger className="bg-bg-primary border-border text-white">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-card border-border text-white">
                      {categories.length > 0 ? (
                        categories.map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Research">Research</SelectItem>
                          <SelectItem value="Product Updates">Product Updates</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Toggle */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary">Publish Status</Label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-white">
                      <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="rounded border-border bg-bg-primary text-accent focus:ring-accent"
                      />
                      Publish immediately to live blog
                    </label>
                  </div>
                </div>

                {/* Cover Image Upload & Inline Preview */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-text-secondary">Cover Image</Label>
                  <BlogCoverImageField
                    value={coverImage}
                    onChange={(url, w, h) => {
                      setCoverImage(url);
                      setCoverImageWidth(w);
                      setCoverImageHeight(h);
                    }}
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-semibold text-text-secondary">Excerpt / Summary *</Label>
                  <textarea
                    required
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 2-sentence summary for search engines and post previews."
                    className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Article Content with Format Toggle & Live Preview */}
                <div className="space-y-3 md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                    <Label className="text-xs font-semibold text-text-secondary">Article Content *</Label>

                    <div className="flex items-center gap-3">
                      {/* Format Mode Selector */}
                      <div className="flex bg-black/60 border border-white/10 rounded-md overflow-hidden text-[11px]">
                        <button
                          type="button"
                          onClick={() => setContentFormat('markdown')}
                          className={`px-2.5 py-1 font-bold uppercase transition-colors ${
                            contentFormat === 'markdown' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          Markdown Mode
                        </button>
                        <button
                          type="button"
                          onClick={() => setContentFormat('html')}
                          className={`px-2.5 py-1 font-bold uppercase transition-colors ${
                            contentFormat === 'html' ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          HTML Mode
                        </button>
                      </div>

                      {/* Toggle Live Preview */}
                      <button
                        type="button"
                        onClick={() => setShowContentPreview(!showContentPreview)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-md border transition-colors ${
                          showContentPreview
                            ? 'bg-accent/20 border-accent text-accent'
                            : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white'
                        }`}
                      >
                        {showContentPreview ? 'Hide Live Preview' : 'Show Live Preview'}
                      </button>
                    </div>
                  </div>

                  <textarea
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      contentFormat === 'markdown'
                        ? "# Article Title\n\nWrite full article body using Markdown syntax...\n\n- Key point 1\n- Key point 2\n\n```ts\nconsole.log('Sample code');\n```"
                        : "<h2>Article Title</h2><p>Write full article body using HTML markup...</p>"
                    }
                    className="w-full bg-bg-primary border border-border rounded-md p-3 text-xs font-mono text-white focus:outline-none focus:border-accent"
                  />

                  {/* Live Formatting Preview */}
                  {showContentPreview && (
                    <div className="mt-4 bg-zinc-950 border border-white/10 p-5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                          Live Render Preview ({contentFormat.toUpperCase()})
                        </span>
                        <span className="text-[10px] text-text-tertiary">Exact view as rendered on public article page</span>
                      </div>
                      <div
                        className="prose prose-invert max-w-none text-text-secondary text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                      />
                    </div>
                  )}
                </div>

                {/* Collapsible SEO Panel */}
                <div className="space-y-2 md:col-span-2 border-t border-border/40 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSeo(!showSeo)}
                    className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider hover:underline"
                  >
                    {showSeo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    SEO Metadata Settings
                  </button>

                  {showSeo && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 bg-black/40 p-4 rounded-lg border border-white/10">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-text-secondary">SEO Meta Title</Label>
                        <Input
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Article Meta Title"
                          className="bg-bg-primary border-border text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-text-secondary">Meta Keywords</Label>
                        <Input
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="ai, agentic, forgeflow"
                          className="bg-bg-primary border-border text-white text-xs"
                        />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <Label className="text-xs text-text-secondary">Meta Description</Label>
                        <textarea
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Meta description for search engines..."
                          className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                <Button type="button" variant="outline" onClick={resetForm} className="border-border text-text-secondary">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-accent hover:bg-accent-hover text-white font-semibold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Update Article' : 'Publish Article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Article List Table */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-sm font-semibold text-white">Articles Catalog ({blogs.length})</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-0">
          {loading ? (
            <div className="px-6 py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-accent" />
            </div>
          ) : blogs.length === 0 ? (
            <div className="px-6 py-12 text-center text-text-tertiary text-sm">
              No articles found. Write one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                    <th className="px-6 py-3">Thumbnail &amp; Title</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-bg-card/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {blog.coverImage ? (
                            <img src={blog.coverImage} alt="" className="w-12 h-12 rounded border border-white/10 object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded border border-white/10 bg-black/40 flex items-center justify-center shrink-0">
                              <ImageIcon className="w-4 h-4 text-text-tertiary" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{blog.title}</p>
                            <p className="text-[10px] text-text-tertiary max-w-sm truncate">{blog.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-accent">
                        {blog.category}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublish(blog.id, blog.published)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold border cursor-pointer ${
                            blog.published
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                          }`}
                        >
                          {blog.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {blog.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-tertiary">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(blog)} className="text-accent hover:bg-accent/10 p-1.5 rounded transition-colors" title="Edit Article">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(blog.id)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors" title="Delete Article">
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

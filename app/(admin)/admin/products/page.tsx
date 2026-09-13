'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit2, Trash2, X, Terminal, Loader2, ExternalLink, Search, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: string;
  type: string;
  visitUrl: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  categoryId: string;
  category?: { id: string; name: string };
  viewCount?: number;
  clickCount?: number;
  seo?: {
    title: string;
    description: string;
    keywords?: string | null;
  } | null;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [visitUrl, setVisitUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [type, setType] = useState('Tool');

  // SEO fields state
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');

  const fetchProductsList = async (query = '', pageNum = 1) => {
    try {
      const resProducts = await fetch(`/api/admin/products?search=${encodeURIComponent(query)}&page=${pageNum}`);
      const dataProducts = await resProducts.json();
      if (dataProducts.success) {
        setProducts(dataProducts.products);
        if (dataProducts.pagination) {
          setTotalPages(dataProducts.pagination.totalPages || 1);
        }
      }
    } catch {
      toast.error('Failed to reload products list.');
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [resProducts, resCategories] = await Promise.all([
          fetch(`/api/admin/products?search=${encodeURIComponent(search)}&page=${page}`),
          fetch('/api/admin/categories')
        ]);
        
        const dataProducts = await resProducts.json();
        const dataCategories = await resCategories.json();

        if (dataProducts.success) {
          setProducts(dataProducts.products);
          if (dataProducts.pagination) {
            setTotalPages(dataProducts.pagination.totalPages || 1);
          }
        }
        if (dataCategories.success) setCategories(dataCategories.categories);
      } catch (err) {
        toast.error('Failed to load admin resources.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [page]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    fetchProductsList(e.target.value, 1);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTagline('');
    setDescription('');
    setStatus('active');
    setVisitUrl('');
    setLogoUrl('');
    setCategoryId('');
    setBannerUrl('');
    setType('Tool');
    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywords('');
    setIsFormOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setTagline(product.tagline);
    setDescription(product.description);
    setStatus(product.status);
    setVisitUrl(product.visitUrl || '');
    setLogoUrl(product.logoUrl || '');
    setCategoryId(product.categoryId);
    setBannerUrl(product.bannerUrl || '');
    setType(product.type || 'Tool');
    setSeoTitle(product.seo?.title || '');
    setSeoDescription(product.seo?.description || '');
    setSeoKeywords(product.seo?.keywords || '');
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = isBanner ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size exceeds limit of ${isBanner ? '5MB' : '2MB'}`);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, WebP, and SVG are accepted.');
      return;
    }

    if (isBanner) setIsBannerUploading(true);
    else setIsLogoUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.asset) {
        if (isBanner) {
          setBannerUrl(data.asset.url);
          toast.success('Banner uploaded successfully');
        } else {
          setLogoUrl(data.asset.url);
          toast.success('Logo uploaded successfully');
        }
      } else {
        toast.error(data.error || 'Failed to upload asset');
      }
    } catch (err) {
      toast.error('Network error uploading asset');
    } finally {
      if (isBanner) setIsBannerUploading(false);
      else setIsLogoUploading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !tagline || !description || !categoryId) {
      toast.error('Please enter all required fields.');
      return;
    }

    setIsSubmitPending(true);
    const payload = {
      id: editingId,
      name,
      tagline,
      description,
      status,
      visitUrl: visitUrl || null,
      logoUrl: logoUrl || null,
      bannerUrl: bannerUrl || null,
      type: type || 'Tool',
      categoryId,
      seo: (seoTitle || seoDescription || seoKeywords) ? {
        title: seoTitle || name,
        description: seoDescription || tagline,
        keywords: seoKeywords || null
      } : null,
    };

    try {
      const response = await fetch('/api/admin/products', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(editingId ? 'Product updated successfully!' : 'Product created successfully!');
        await fetchProductsList(search, page);
        resetForm();
      } else {
        toast.error(result.error || 'Failed to submit product.');
      }
    } catch (err) {
      toast.error('An error occurred during submission.');
    } finally {
      setIsSubmitPending(false);
    }
  };

  const handleDeleteClick = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Product deleted successfully!');
        fetchProductsList(search, page);
      } else {
        toast.error(result.error || 'Failed to delete product.');
      }
    } catch (err) {
      toast.error('An error occurred during deletion.');
    }
  };

  const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name;

  return (
    <TooltipProvider>
      <div className="space-y-8 select-none">
        {/* Header action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-accent" />
              Manage Products
            </h1>
            <p className="text-text-secondary text-sm">
              Configure showcased software platforms in the public catalog.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!isFormOpen && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Search products..."
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
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-text-secondary text-xs">Loading products records...</p>
          </div>
        ) : isFormOpen ? (
          /* Edit/Create Form panel */
          <Card className="glass-panel border-border shadow-card relative overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-white tracking-wide uppercase">
                {editingId ? 'Edit Product Details' : 'Construct New Product'}
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
                  {/* Product Name */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-name" className="text-xs font-semibold text-text-secondary">
                        Product Name <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>The main title shown on the public product card and detail page.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="prod-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Distributed Scheduler Engine"
                      required
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  {/* Category Group select */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-semibold text-text-secondary">
                        Category Group <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Organizes this product under a public category filter.</TooltipContent>
                      </Tooltip>
                    </div>
                    {categories.length === 0 ? (
                      <div className="text-xs text-zinc-500 italic py-2">Loading categories...</div>
                    ) : (
                      <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
                        <SelectTrigger className="bg-bg-primary border-border text-white focus:border-accent">
                          <SelectValue placeholder="Select a Category">
                            {selectedCategoryName || 'Select a Category'}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-bg-card border-border text-white">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id} className="focus:bg-accent focus:text-white">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Tagline */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-tagline" className="text-xs font-semibold text-text-secondary">
                        Tagline (Brief description) <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Short summary displayed below title on product cards and hero banners.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="prod-tagline"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Scalable low-latency task orchestration pipeline."
                      required
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  {/* Status select */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label className="text-xs font-semibold text-text-secondary">
                        Pipeline Stage <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Controls badge status (Active, Beta, Archived) shown publicly.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={status} onValueChange={(val) => setStatus(val || 'active')}>
                      <SelectTrigger className="bg-bg-primary border-border text-white focus:border-accent">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-bg-card border-border text-white">
                        <SelectItem value="active">Active (Production)</SelectItem>
                        <SelectItem value="beta">Beta (Evaluation)</SelectItem>
                        <SelectItem value="archived">Archived (Deprecated)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Type Input */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-type" className="text-xs font-semibold text-text-secondary">
                        Product Type
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Subtype label like Tool, SaaS Platform, Android App, Web Utility.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="prod-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="e.g. Tool, SaaS Platform, Web Utility"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  {/* Launch Visit URL */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-visit" className="text-xs font-semibold text-text-secondary">
                        Launch Visit URL (Subdomain or App Link)
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Destination URL when visitors click &quot;Launch Platform&quot;.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="prod-visit"
                      value={visitUrl}
                      onChange={(e) => setVisitUrl(e.target.value)}
                      placeholder="e.g. https://toolkit.warishlabs.in"
                      className="bg-bg-primary border-border focus:border-accent text-white"
                    />
                  </div>

                  {/* Brand Logo Upload with Inline Preview */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-logo-file" className="text-xs font-semibold text-text-secondary">
                        Product Brand Logo
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Square logo shown on product card headers and detail page.</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-4 bg-black/40 border border-white/10 p-3 rounded-lg">
                      {logoUrl ? (
                        <div className="relative w-12 h-12 rounded-lg border border-white/20 bg-black/60 p-1 flex items-center justify-center overflow-hidden shrink-0">
                          <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setLogoUrl('')}
                            className="absolute -top-1 -right-1 bg-destructive text-white p-0.5 rounded-full hover:scale-110 transition-all"
                            title="Remove logo"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex items-center justify-center shrink-0 text-[10px] text-text-tertiary">
                          No Logo
                        </div>
                      )}
                      <div className="flex-1">
                        <Input
                          id="prod-logo-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, false)}
                          disabled={isLogoUploading}
                          className="bg-bg-primary border-border text-white text-xs file:bg-bg-card file:border-border file:text-white file:rounded file:px-2 file:py-1 file:mr-2 file:cursor-pointer"
                        />
                        {isLogoUploading && <p className="text-[10px] text-accent animate-pulse mt-1">Uploading logo to Cloudinary...</p>}
                      </div>
                    </div>
                  </div>

                  {/* Hero Banner Upload with Inline Preview */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-banner-file" className="text-xs font-semibold text-text-secondary">
                        Product Hero Showcase Banner
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Wide header image rendered at top of product detail page.</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-col gap-3 bg-black/40 border border-white/10 p-3 rounded-lg">
                      {bannerUrl && (
                        <div className="relative w-full h-32 rounded-lg border border-white/20 overflow-hidden bg-black/60">
                          <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setBannerUrl('')}
                            className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full hover:scale-110 transition-all"
                            title="Remove banner"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <Input
                        id="prod-banner-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        disabled={isBannerUploading}
                        className="bg-bg-primary border-border text-white text-xs file:bg-bg-card file:border-border file:text-white file:rounded file:px-2 file:py-1 file:mr-2 file:cursor-pointer"
                      />
                      {isBannerUploading && <p className="text-[10px] text-accent animate-pulse">Uploading banner to Cloudinary...</p>}
                    </div>
                  </div>

                  {/* Description Details HTML */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="prod-desc" className="text-xs font-semibold text-text-secondary">
                        Full Product Description &amp; Technical Specs (HTML supported) <span className="text-destructive">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger type="button"><HelpCircle className="w-3.5 h-3.5 text-text-tertiary" /></TooltipTrigger>
                        <TooltipContent>Renders styled headings, lists, and paragraphs on public product page.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      id="prod-desc"
                      rows={6}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="<h2>Overview</h2><p>Describe product features and technical details using HTML markup.</p>"
                      required
                      className="bg-bg-primary border-border focus:border-accent text-white font-mono text-xs"
                    />
                  </div>

                  {/* SEO Metadata Settings */}
                  <div className="md:col-span-2 border-t border-border pt-4 mt-2 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                      SEO Metadata Settings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-text-secondary">Meta Title</Label>
                        <Input
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="e.g. Toolkit | Fast Private Developer Utilities"
                          className="bg-bg-primary border-border text-white text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-text-secondary">Meta Keywords (Comma separated)</Label>
                        <Input
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="developer tools, web utilities, offline tools"
                          className="bg-bg-primary border-border text-white text-xs"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-xs font-semibold text-text-secondary">Meta Description</Label>
                        <Textarea
                          rows={2}
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Compelling 150-character summary for Google search results."
                          className="bg-bg-primary border-border text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
                  <Button type="button" variant="outline" onClick={resetForm} className="border-border text-text-secondary">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitPending} className="bg-accent hover:bg-accent-hover text-white font-semibold">
                    {isSubmitPending ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? 'Update Product' : 'Construct Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Products List Table */
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Product Catalog ({products.length})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                      <th className="px-6 py-3">Product Name</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Stage</th>
                      <th className="px-6 py-3">Visit Link</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-bg-card/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {prod.logoUrl ? (
                              <img src={prod.logoUrl} alt="" className="w-8 h-8 rounded border border-white/10 object-contain bg-black/40" />
                            ) : (
                              <div className="w-8 h-8 rounded border border-white/10 bg-black/40 flex items-center justify-center text-[9px] text-text-tertiary">
                                P
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">{prod.name}</p>
                              <p className="text-[10px] text-text-tertiary max-w-xs truncate">{prod.tagline}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-accent">
                          {prod.category?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-bg-card border border-border px-2 py-0.5 rounded text-xs font-semibold text-white capitalize">
                            {prod.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {prod.visitUrl ? (
                            <a href={prod.visitUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline flex items-center gap-1 text-xs">
                              {prod.visitUrl.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-text-tertiary text-xs italic">Unavailable</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button onClick={() => handleEditClick(prod)} className="text-accent hover:bg-accent/10 p-1.5 rounded transition-colors" title="Edit Product">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteClick(prod.id, prod.name)} className="text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors" title="Delete Product">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

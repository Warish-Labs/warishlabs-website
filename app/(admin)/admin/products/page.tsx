'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit2, Trash2, X, Terminal, Loader2, ExternalLink, GitBranch, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

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
  githubUrl?: string | null;
  categoryId: string;
  category?: { name: string };
  technologies?: Array<{
    technology: {
      id: string;
      name: string;
    };
  }>;
}

interface Category {
  id: string;
  name: string;
}

interface Technology {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTechnologies, setAllTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitPending, setIsSubmitPending] = useState(false);

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
  
  // Dynamic Content Audit addition states
  const [githubUrl, setGithubUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [type, setType] = useState('Tool');
  const [technologyIds, setTechnologyIds] = useState<string[]>([]);

  // Fetch initial data
  const fetchProductsList = async () => {
    try {
      const resProducts = await fetch('/api/admin/products');
      const dataProducts = await resProducts.json();
      if (dataProducts.success) setProducts(dataProducts.products);
    } catch {
      toast.error('Failed to reload products list.');
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [resProducts, resCategories, resTechs] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories'),
          fetch('/api/admin/technologies')
        ]);
        
        const dataProducts = await resProducts.json();
        const dataCategories = await resCategories.json();
        const dataTechs = await resTechs.json();

        if (dataProducts.success) setProducts(dataProducts.products);
        if (dataCategories.success) setCategories(dataCategories.categories);
        if (dataTechs.success) setAllTechnologies(dataTechs.technologies);
      } catch (err) {
        toast.error('Failed to load admin resources.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setTagline('');
    setDescription('');
    setStatus('active');
    setVisitUrl('');
    setLogoUrl('');
    setCategoryId('');
    setGithubUrl('');
    setBannerUrl('');
    setType('Tool');
    setTechnologyIds([]);
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
    setGithubUrl(product.githubUrl || '');
    setBannerUrl(product.bannerUrl || '');
    setType(product.type || 'Tool');
    setTechnologyIds(product.technologies?.map((t) => t.technology.id) || []);
    setIsFormOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBanner: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleTechCheckboxChange = (techId: string, checked: boolean) => {
    if (checked) {
      setTechnologyIds((prev) => [...prev, techId]);
    } else {
      setTechnologyIds((prev) => prev.filter((id) => id !== techId));
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
      githubUrl: githubUrl || null,
      type: type || 'Tool',
      categoryId,
      technologyIds,
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
        await fetchProductsList();
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
        setProducts(products.filter(p => p.id !== id));
      } else {
        toast.error(result.error || 'Failed to delete product.');
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
            <Briefcase className="w-8 h-8 text-accent" />
            Manage Products
          </h1>
          <p className="text-text-secondary text-sm">
            Configure showcased software platforms in the catalog.
          </p>
        </div>
        {!isFormOpen && (
          <Button
            onClick={() => setIsFormOpen(true)}
            className="bg-accent hover:bg-accent-hover text-white active:scale-[0.97] transition-all font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        )}
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
                  <Label htmlFor="prod-name" className="text-xs font-semibold text-text-secondary">
                    Product Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="prod-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Distributed Scheduler Engine"
                    required
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Category ID select */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-text-secondary">
                    Category Group <span className="text-destructive">*</span>
                  </Label>
                  <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
                    <SelectTrigger className="bg-bg-primary border-border text-white focus:border-accent">
                      <SelectValue placeholder="Select a Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-bg-card border-border text-white">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="focus:bg-accent focus:text-white">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tagline */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="prod-tagline" className="text-xs font-semibold text-text-secondary">
                    Tagline (Brief description) <span className="text-destructive">*</span>
                  </Label>
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
                  <Label className="text-xs font-semibold text-text-secondary">
                    Pipeline Stage <span className="text-destructive">*</span>
                  </Label>
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
                  <Label htmlFor="prod-type" className="text-xs font-semibold text-text-secondary">
                    Product Type
                  </Label>
                  <Input
                    id="prod-type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Tool, Platform, Library, Service"
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Launch Visit URL */}
                <div className="space-y-2">
                  <Label htmlFor="prod-visit" className="text-xs font-semibold text-text-secondary">
                    Launch Visit URL (Optional)
                  </Label>
                  <Input
                    id="prod-visit"
                    value={visitUrl}
                    onChange={(e) => setVisitUrl(e.target.value)}
                    placeholder="e.g. https://scheduler.warishlabs.in"
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* GitHub Repository URL */}
                <div className="space-y-2">
                  <Label htmlFor="prod-repo" className="text-xs font-semibold text-text-secondary">
                    GitHub Repository URL (Optional)
                  </Label>
                  <Input
                    id="prod-repo"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="e.g. https://github.com/warishlabs/engine"
                    className="bg-bg-primary border-border focus:border-accent text-white"
                  />
                </div>

                {/* Brand Logo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="prod-logo-file" className="text-xs font-semibold text-text-secondary">
                    Product Brand Logo
                  </Label>
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <div className="w-10 h-10 rounded border border-border bg-bg-card flex items-center justify-center overflow-hidden shrink-0">
                        <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded border border-dashed border-border flex items-center justify-center shrink-0">
                        <span className="text-[9px] text-text-tertiary">No Logo</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="prod-logo-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, false)}
                        disabled={isLogoUploading}
                        className="bg-bg-primary border-border focus:border-accent text-white text-xs file:bg-bg-card file:border-border file:text-white file:rounded file:px-2 file:py-0.5 file:mr-2 file:cursor-pointer"
                      />
                    </div>
                  </div>
                  {isLogoUploading && <p className="text-[10px] text-accent animate-pulse">Uploading logo to Cloudinary...</p>}
                </div>

                {/* Hero Banner Upload */}
                <div className="space-y-2">
                  <Label htmlFor="prod-banner-file" className="text-xs font-semibold text-text-secondary">
                    Product Showcase Banner
                  </Label>
                  <div className="flex items-center gap-3">
                    {bannerUrl ? (
                      <div className="w-16 h-10 rounded border border-border bg-bg-card flex items-center justify-center overflow-hidden shrink-0">
                        <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-10 rounded border border-dashed border-border flex items-center justify-center shrink-0">
                        <span className="text-[9px] text-text-tertiary font-mono">No Banner</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="prod-banner-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, true)}
                        disabled={isBannerUploading}
                        className="bg-bg-primary border-border focus:border-accent text-white text-xs file:bg-bg-card file:border-border file:text-white file:rounded file:px-2 file:py-0.5 file:mr-2 file:cursor-pointer"
                      />
                    </div>
                  </div>
                  {isBannerUploading && <p className="text-[10px] text-accent animate-pulse">Uploading banner to Cloudinary...</p>}
                </div>

                {/* Technologies checkboxes */}
                <div className="space-y-2 md:col-span-2 border-t border-border/30 pt-4">
                  <Label className="text-xs font-semibold text-text-secondary block mb-2">
                    Technologies / Tech Stack Matrix
                  </Label>
                  {allTechnologies.length === 0 ? (
                    <p className="text-xs text-text-tertiary italic">No technology tags found in database.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 border border-white/5 rounded-lg p-4">
                      {allTechnologies.map((tech) => {
                        const isChecked = technologyIds.includes(tech.id);
                        return (
                          <label key={tech.id} className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary hover:text-white transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleTechCheckboxChange(tech.id, e.target.checked)}
                              className="rounded bg-bg-primary border-border border text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                            />
                            <span>{tech.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Description Textarea */}
                <div className="space-y-2 md:col-span-2 border-t border-border/30 pt-4">
                  <Label htmlFor="prod-desc" className="text-xs font-semibold text-text-secondary">
                    HTML Description/Specs <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="prod-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Enter HTML formatted product specs or technical details..."
                    required
                    className="bg-bg-primary border-border focus:border-accent text-white font-mono text-xs leading-relaxed"
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
                    'Save Product'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Products List Grid */
        <Card className="glass-panel border-border shadow-card overflow-hidden">
          <CardContent className="p-0">
            {products.length === 0 ? (
              <div className="text-center py-20 text-text-tertiary text-sm flex flex-col items-center gap-4">
                <Terminal className="w-12 h-12 text-text-tertiary opacity-40 animate-pulse" />
                <p>No products constructed in the database catalog.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-bg-secondary text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Resources</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-xs">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-bg-card/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                          {product.logoUrl ? (
                            <div className="w-8 h-8 rounded border border-border bg-bg-card flex items-center justify-center overflow-hidden shrink-0">
                              <img src={product.logoUrl} alt="" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded border border-dashed border-border flex items-center justify-center shrink-0">
                              <span className="text-[8px] text-text-tertiary">Logo</span>
                            </div>
                          )}
                          <div>
                            <p>{product.name}</p>
                            <span className="text-[10px] font-normal text-text-secondary leading-relaxed line-clamp-1 max-w-[280px]">
                              {product.tagline}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-medium">
                          {product.category?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-mono">
                          {product.type}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                              product.status === 'active'
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : product.status === 'beta'
                                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                : "bg-text-tertiary/10 border-border text-text-secondary"
                            )}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-text-tertiary flex items-center gap-3 mt-1.5">
                          {product.visitUrl ? (
                            <a
                              href={product.visitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline flex items-center gap-1"
                              title="Launch Platform"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-600 italic">No Launch</span>
                          )}
                          {product.githubUrl ? (
                            <a
                              href={product.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white hover:text-accent flex items-center gap-1"
                              title="GitHub Codebase"
                            >
                              <GitBranch className="w-3.5 h-3.5 text-accent" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-zinc-600 italic">No Repo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(product)}
                            className="border-border hover:border-accent hover:text-white p-2 h-8 w-8 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(product.id, product.name)}
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

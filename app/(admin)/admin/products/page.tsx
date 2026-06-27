'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Plus, Edit2, Trash2, X, Terminal, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  status: string;
  visitUrl: string | null;
  categoryId: string;
  category?: { name: string };
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

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [visitUrl, setVisitUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [resProducts, resCategories] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/categories')
        ]);
        
        const dataProducts = await resProducts.json();
        const dataCategories = await resCategories.json();

        if (dataProducts.success) setProducts(dataProducts.products);
        if (dataCategories.success) setCategories(dataCategories.categories);
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
    setCategoryId('');
    setIsFormOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setTagline(product.tagline);
    setDescription(product.description);
    setStatus(product.status);
    setVisitUrl(product.visitUrl || '');
    setCategoryId(product.categoryId);
    setIsFormOpen(true);
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
      categoryId
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
        
        // Refresh products list
        const resProducts = await fetch('/api/admin/products');
        const dataProducts = await resProducts.json();
        if (dataProducts.success) setProducts(dataProducts.products);

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
                    placeholder="e.g. distributed Scheduler Engine"
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

                {/* Launch URL */}
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

                {/* Description Textarea */}
                <div className="space-y-2 md:col-span-2">
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
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Launch Link</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle text-xs">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-bg-card/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">
                          <p>{product.name}</p>
                          <span className="text-[10px] font-normal text-text-secondary leading-relaxed line-clamp-1 max-w-[280px]">
                            {product.tagline}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-text-secondary font-medium">
                          {product.category?.name || 'Unassigned'}
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
                        <td className="px-6 py-4 font-mono text-text-tertiary">
                          {product.visitUrl ? (
                            <a
                              href={product.visitUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              Visit <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            'N/A'
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

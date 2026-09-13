'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FolderTree, Plus, Trash2, Edit2, HelpCircle, X, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.error || 'Failed to fetch categories');
      }
    } catch (err) {
      toast.error('Network error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
  };

  const handleEditClick = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
  };

  // Handle Create/Update Category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId ? { id: editingId, name, description } : { name, description };

      const res = await fetch('/api/admin/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingId ? 'Category updated successfully' : 'Category created successfully');
        resetForm();
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to save category');
      }
    } catch (err) {
      toast.error('Network error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Category
  const handleDelete = async (id: string, productCount: number) => {
    if (productCount > 0) {
      toast.error('Cannot delete category that contains products. Reassign or delete the products first.');
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (err) {
      toast.error('Network error deleting category');
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Overview Card */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-accent" /> Categories Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Manage product classification categories. Categories define how products and SaaS platforms are organized in the public portfolio view.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create/Edit Form */}
        <div className="lg:col-span-4">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4 flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </CardTitle>
              {editingId && (
                <button
                  onClick={resetForm}
                  className="text-text-tertiary hover:text-white p-1 rounded transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Category Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Developer Utilities"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary of the category"
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent h-24 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {editingId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  {isSubmitting ? (editingId ? 'Updating...' : 'Creating...') : (editingId ? 'Update Category' : 'Create Category')}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Guide Card */}
          <div className="mt-6 bg-accent-subtle/20 border border-accent/10 rounded-lg p-4 flex gap-3">
            <HelpCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-xs font-semibold text-white">Category Protection</h5>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Categories containing active products cannot be deleted until products are reassigned to another category.
              </p>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="lg:col-span-8">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Existing Categories</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-0">
              {loading ? (
                <div className="px-6 py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                </div>
              ) : categories.length === 0 ? (
                <div className="px-6 py-12 text-center text-text-tertiary text-sm">
                  No categories found. Create one on the left.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                        <th className="px-6 py-3">Name / Slug</th>
                        <th className="px-6 py-3">Description</th>
                        <th className="px-6 py-3">Products</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-sm text-text-secondary">
                      {categories.map((cat) => {
                        const productCount = cat._count?.products || 0;
                        return (
                          <tr key={cat.id} className="hover:bg-bg-card/30 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-white">{cat.name}</p>
                              <p className="text-[10px] text-text-tertiary">{cat.slug}</p>
                            </td>
                            <td className="px-6 py-4 max-w-xs truncate">
                              {cat.description || <span className="text-text-tertiary italic">No description</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className="bg-bg-card border border-border px-2 py-0.5 rounded text-xs font-semibold text-white">
                                {productCount}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditClick(cat)}
                                className="text-accent hover:bg-accent/10 p-1.5 rounded transition-colors cursor-pointer inline-flex"
                                title="Edit Category"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id, productCount)}
                                disabled={productCount > 0}
                                className={`p-1.5 rounded transition-colors inline-flex ${
                                  productCount > 0
                                    ? 'text-zinc-600 cursor-not-allowed opacity-50'
                                    : 'text-destructive hover:bg-destructive/10 cursor-pointer'
                                }`}
                                title={productCount > 0 ? 'Cannot delete category containing products' : 'Delete Category'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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

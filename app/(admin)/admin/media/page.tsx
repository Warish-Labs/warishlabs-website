'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Image as ImageIcon, Trash2, Plus, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { formatBytes, formatDate } from '@/utils/formatters';

export default function AdminMediaPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // File Upload states
  const [file, setFile] = useState<File | null>(null);
  const [folder, setFolder] = useState('products');
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success) {
        setAssets(data.assets);
      } else {
        toast.error(data.error || 'Failed to fetch media assets');
      }
    } catch (err) {
      toast.error('Network error fetching assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Media asset uploaded successfully');
        setFile(null);
        // Clear file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        fetchAssets();
      } else {
        toast.error(data.error || 'Failed to upload media');
      }
    } catch (err) {
      toast.error('Network error uploading media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset? This will destroy the file in Cloudinary.')) return;

    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Media asset deleted');
        fetchAssets();
      } else {
        toast.error(data.error || 'Failed to delete asset');
      }
    } catch (err) {
      toast.error('Network error deleting asset');
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/media/sync', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Media library synchronized successfully.');
        fetchAssets();
      } else {
        toast.error(data.error || 'Failed to sync media library.');
      }
    } catch (err) {
      toast.error('Network error during synchronization.');
    } finally {
      setIsSyncing(false);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Asset URL copied to clipboard');
  };

  return (
    <div className="space-y-8 select-none">
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-accent" /> Media Library (Cloudinary)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Upload and audit image assets utilized inside SaaS product specs and blog headers.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-4">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Upload New Asset</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Select File</label>
                  <input
                    id="file-input"
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white file:bg-accent file:border-none file:text-white file:px-2 file:py-1 file:rounded file:mr-3 file:cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">Cloud Folder</label>
                  <select
                    value={folder}
                    onChange={(e) => setFolder(e.target.value)}
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
                  >
                    <option value="products">warishlabs/products</option>
                    <option value="labs">warishlabs/labs</option>
                    <option value="general">warishlabs/general</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Column */}
        <div className="lg:col-span-8">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white">Cloud Asset Registry</CardTitle>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-3 py-1.5 bg-white/5 border border-white/10 hover:border-accent hover:text-white rounded text-[10px] font-bold uppercase text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Cloudinary'}
              </button>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <div className="py-12 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                </div>
              ) : assets.length === 0 ? (
                <div className="py-12 text-center text-text-tertiary text-sm">
                  No media assets uploaded yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {assets.map((asset) => (
                    <div 
                      key={asset.id} 
                      className="group bg-bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-accent/40 transition-all duration-200"
                    >
                      {/* Image Preview */}
                      <div className="h-32 bg-black flex items-center justify-center relative overflow-hidden">
                        <img 
                          src={asset.url} 
                          alt={asset.fileName} 
                          className="max-h-full max-w-full object-contain"
                        />
                        {/* Copy Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={() => copyUrl(asset.url)}
                            className="bg-accent hover:bg-accent/80 text-white p-2 rounded cursor-pointer transition-colors"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id)}
                            className="bg-destructive hover:bg-destructive/80 text-white p-2 rounded cursor-pointer transition-colors"
                            title="Delete Asset"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Detail text */}
                      <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-white truncate" title={asset.fileName}>
                            {asset.fileName}
                          </p>
                          <p className="text-[10px] text-text-tertiary truncate">
                            ID: {asset.publicId}
                          </p>
                        </div>
                        <div className="flex justify-between items-center text-[9px] text-text-tertiary border-t border-border/40 pt-2">
                          <span>{formatBytes(asset.fileSize)}</span>
                          <span>{formatDate(asset.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

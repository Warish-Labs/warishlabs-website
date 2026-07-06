'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Image as ImageIcon,
  Trash2,
  Plus,
  Copy,
  RefreshCw,
  Folder,
  FolderOpen,
  ChevronRight,
  ArrowLeft,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CloudFolderSelect } from '@/components/admin/CloudFolderSelect';

interface MediaFolder {
  id: string;
  path: string;
  name: string;
}

interface CloudinaryAsset {
  publicId: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  fileName: string;
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient();

  // Folder navigation state
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<Array<{ label: string; path: string | null }>>([
    { label: 'Root', path: null },
  ]);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('warishlabs/products');
  const [isUploading, setIsUploading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: foldersData, isLoading: foldersLoading } = useQuery<{
    success: boolean;
    folders: MediaFolder[];
  }>({
    queryKey: ['media-folders'],
    queryFn: async () => {
      const res = await fetch('/api/admin/media?type=folders');
      if (!res.ok) throw new Error('Failed to fetch folders');
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: assetsData, isLoading: assetsLoading, refetch: refetchAssets } = useQuery<{
    success: boolean;
    assets: CloudinaryAsset[];
  }>({
    queryKey: ['media-folder-assets', currentFolder],
    queryFn: async () => {
      if (!currentFolder) return { success: true, assets: [] };
      const res = await fetch(`/api/admin/media?type=folder-contents&path=${encodeURIComponent(currentFolder)}`);
      if (!res.ok) throw new Error('Failed to fetch assets');
      return res.json();
    },
    enabled: !!currentFolder,
    staleTime: 1000 * 60 * 2,
  });

  const folders = foldersData?.folders ?? [];
  const assets = assetsData?.assets ?? [];

  // Filter folders to show only those at the current level
  const visibleFolders = folders.filter((f) => {
    if (!currentFolder) {
      // Root: show only top-level folders (no slash in path except leading)
      const parts = f.path.split('/');
      return parts.length === 2; // e.g. "warishlabs/products" → 2 parts
    }
    // Inside a folder: show direct children only
    const prefix = currentFolder + '/';
    if (!f.path.startsWith(prefix)) return false;
    const remainder = f.path.slice(prefix.length);
    return !remainder.includes('/'); // no further nesting
  });

  // ── Navigation ────────────────────────────────────────────────────────
  const enterFolder = useCallback(
    (folder: MediaFolder) => {
      setCurrentFolder(folder.path);
      setUploadFolder(folder.path);
      setBreadcrumb((prev) => [...prev, { label: folder.name, path: folder.path }]);
    },
    []
  );

  const navigateTo = useCallback(
    (index: number) => {
      const crumb = breadcrumb[index];
      setBreadcrumb(breadcrumb.slice(0, index + 1));
      setCurrentFolder(crumb.path);
      if (crumb.path) setUploadFolder(crumb.path);
    },
    [breadcrumb]
  );

  // ── Actions ──────────────────────────────────────────────────────────
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/media/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Sync complete');
        // Invalidate folder list so dropdown & browser both refresh
        queryClient.invalidateQueries({ queryKey: ['media-folders'] });
      } else {
        toast.error(data.error || 'Sync failed');
      }
    } catch {
      toast.error('Network error during sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('folder', uploadFolder);

    try {
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast.success('Asset uploaded successfully');
        setUploadFile(null);
        const fileInput = document.getElementById('media-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        // Refresh current folder assets
        refetchAssets();
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Network error uploading');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAsset = async (publicId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}" from Cloudinary? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/admin/media?publicId=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Asset deleted');
        refetchAssets();
      } else {
        toast.error(data.error || 'Failed to delete asset');
      }
    } catch {
      toast.error('Network error deleting asset');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 select-none">
      {/* Header card */}
      <Card className="glass-panel border-border shadow-card overflow-hidden">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-text-tertiary flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-accent" /> Media Library (Cloudinary)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-text-secondary text-sm">
            Browse Cloudinary folders, upload assets, and sync folder structure from the cloud.
            Use <span className="text-accent font-semibold">Sync Cloudinary</span> to pull the latest folder list into the dropdown.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Column */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-sm font-semibold text-white">Upload New Asset</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    Select File
                  </label>
                  <input
                    id="media-file-input"
                    type="file"
                    required
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white file:bg-accent file:border-none file:text-white file:px-2 file:py-1 file:rounded file:mr-3 file:cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                    Cloud Folder
                  </label>
                  <CloudFolderSelect
                    value={uploadFolder}
                    onChange={setUploadFolder}
                    defaultFolder="warishlabs/products"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="w-full bg-accent hover:bg-accent/80 text-white font-semibold text-xs uppercase tracking-wider py-2.5 rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Sync Card */}
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardContent className="pt-5 pb-5">
              <p className="text-[11px] text-text-tertiary mb-3">
                Sync pulls all folder paths from Cloudinary into the local DB, so the folder dropdown stays current.
              </p>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 hover:border-accent hover:text-white rounded text-[10px] font-bold uppercase text-zinc-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Cloudinary Folders'}
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Browser Column */}
        <div className="lg:col-span-8">
          <Card className="glass-panel border-border shadow-card overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 flex-wrap">
                {breadcrumb.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-text-tertiary shrink-0" />}
                    <button
                      onClick={() => navigateTo(idx)}
                      className={`text-xs font-semibold transition-colors ${
                        idx === breadcrumb.length - 1
                          ? 'text-white cursor-default'
                          : 'text-text-tertiary hover:text-accent cursor-pointer'
                      }`}
                    >
                      {crumb.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Back button */}
              {currentFolder && (
                <button
                  onClick={() => navigateTo(breadcrumb.length - 2)}
                  className="mb-4 flex items-center gap-1.5 text-xs text-text-tertiary hover:text-accent transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              )}

              {/* Folders grid */}
              {foldersLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                </div>
              ) : visibleFolders.length === 0 && !currentFolder ? (
                <div className="py-8 text-center space-y-3">
                  <AlertTriangle className="w-8 h-8 text-amber-400/60 mx-auto" />
                  <p className="text-text-tertiary text-sm">No folders synced yet.</p>
                  <p className="text-text-tertiary text-xs">
                    Click <span className="text-accent font-semibold">Sync Cloudinary Folders</span> to pull your folder structure.
                  </p>
                </div>
              ) : visibleFolders.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {visibleFolders.map((folder) => (
                    <button
                      key={folder.id}
                      onDoubleClick={() => enterFolder(folder)}
                      onClick={() => enterFolder(folder)}
                      className="group flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-bg-card hover:border-accent/60 hover:bg-accent/5 transition-all text-center cursor-pointer"
                      title={`Double-click to browse ${folder.path}`}
                    >
                      {currentFolder ? (
                        <FolderOpen className="w-8 h-8 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
                      ) : (
                        <Folder className="w-8 h-8 text-amber-400/70 group-hover:text-amber-400 transition-colors" />
                      )}
                      <span className="text-xs font-semibold text-text-secondary group-hover:text-white transition-colors truncate w-full">
                        {folder.name}
                      </span>
                      <span className="text-[9px] text-text-tertiary truncate w-full">{folder.path}</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {/* Assets in current folder */}
              {currentFolder && (
                <>
                  {assetsLoading ? (
                    <div className="py-8 flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent" />
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="py-8 text-center text-text-tertiary text-sm">
                      <Upload className="w-6 h-6 mx-auto mb-2 opacity-40" />
                      No assets in this folder yet. Upload one on the left.
                    </div>
                  ) : (
                    <>
                      <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-wider mb-3">
                        {assets.length} Asset{assets.length !== 1 ? 's' : ''} in {currentFolder}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {assets.map((asset) => (
                          <div
                            key={asset.publicId}
                            className="group bg-bg-card border border-border rounded-lg overflow-hidden flex flex-col hover:border-accent/40 transition-all duration-200"
                          >
                            {/* Image preview */}
                            <div className="h-28 bg-black flex items-center justify-center relative overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={asset.url}
                                alt={asset.fileName}
                                className="max-h-full max-w-full object-contain"
                              />
                              {/* Hover overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                  onClick={() => copyUrl(asset.url)}
                                  className="bg-accent hover:bg-accent/80 text-white p-1.5 rounded cursor-pointer transition-colors"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAsset(asset.publicId, asset.fileName)}
                                  className="bg-destructive hover:bg-destructive/80 text-white p-1.5 rounded cursor-pointer transition-colors"
                                  title="Delete Asset"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {/* Metadata */}
                            <div className="p-2.5 space-y-1.5 flex-1">
                              <p className="text-xs font-semibold text-white truncate" title={asset.fileName}>
                                {asset.fileName}
                              </p>
                              {asset.width > 0 && asset.height > 0 && (
                                <p className="text-[9px] text-text-tertiary">
                                  {asset.width}×{asset.height} · {asset.format.toUpperCase()}
                                </p>
                              )}
                              <p className="text-[9px] text-text-tertiary">
                                {formatBytes(asset.bytes)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

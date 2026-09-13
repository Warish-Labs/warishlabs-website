'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Upload, Link as LinkIcon, ImageIcon, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { CloudFolderSelect } from './CloudFolderSelect';

interface BlogCoverImageFieldProps {
  /** Current cover image URL stored in the form */
  value: string;
  /** Called when the URL is resolved (upload or pasted link) with optional dimensions */
  onChange: (url: string, width?: number, height?: number) => void;
}

type Mode = 'link' | 'upload';

interface ImageDimensions {
  width: number;
  height: number;
}

// Calculate GCD for aspect ratio simplification
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function getAspectRatio(w: number, h: number): string {
  const divisor = gcd(w, h);
  const rw = w / divisor;
  const rh = h / divisor;
  // Only show simplified ratio if it's reasonable
  if (rw <= 20 && rh <= 20) {
    return `${rw}:${rh}`;
  }
  return `${(w / h).toFixed(2)}:1`;
}

function isGoodSocialRatio(w: number, h: number): boolean {
  const ratio = w / h;
  const target = 1200 / 630; // 1.905
  return Math.abs(ratio - target) / target < 0.15; // within 15%
}

function isSafeImageUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('blob:')) {
    return true;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function BlogCoverImageField({ value, onChange }: BlogCoverImageFieldProps) {
  const [mode, setMode] = useState<Mode>('link');
  const [linkInput, setLinkInput] = useState(value || '');
  const [previewUrl, setPreviewUrl] = useState<string>(
    value && isSafeImageUrl(value) ? value : ''
  );
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isProbing, setIsProbing] = useState(false);

  // Upload mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadFolder, setUploadFolder] = useState('warishlabs/blog');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  // Sync external value → link input on edit-load
  useEffect(() => {
    if (value && value !== linkInput) {
      setLinkInput(value);
      if (isSafeImageUrl(value)) {
        setPreviewUrl(value);
      } else {
        setPreviewUrl('');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /**
   * Probe an image URL by loading it client-side and reading naturalWidth/Height.
   */
  const probeImageUrl = useCallback((url: string) => {
    if (!url) {
      setLinkError(null);
      setDimensions(null);
      return;
    }

    if (!isSafeImageUrl(url)) {
      setLinkError("Couldn't load image from this URL — the link may be invalid or restricted.");
      setPreviewUrl('');
      setDimensions(null);
      return;
    }

    setIsProbing(true);
    setLinkError(null);

    const img = new window.Image();
    img.onload = () => {
      setIsProbing(false);
      setPreviewUrl(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setDimensions({ width: w, height: h });
      onChange(url, w, h);
    };
    img.onerror = () => {
      setIsProbing(false);
      setLinkError("Couldn't load image from this URL — the link may be invalid or restricted.");
      setPreviewUrl('');
      setDimensions(null);
    };
    img.src = url;
  }, [onChange]);

  // Debounced URL probe on link input change
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLinkInput(url);
    setLinkError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      probeImageUrl(url);
    }, 400);
  };

  const handleLinkBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    probeImageUrl(linkInput);
  };

  /**
   * File selected — generate local blob preview immediately, read dimensions.
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Unsupported format. Please upload PNG, JPEG, WebP, or AVIF.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max size is 5 MB.`);
      return;
    }

    // Revoke previous blob if any
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
    }

    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;
    setLocalBlobUrl(blobUrl);
    setSelectedFile(file);
    setUploadError(null);
    setDimensions(null);

    // Read dimensions from local blob
    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = blobUrl;
  };

  /**
   * Upload file to Cloudinary via the server-side upload route.
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folder', uploadFolder);

    try {
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        // Swap blob preview with the real Cloudinary URL
        if (isSafeImageUrl(data.url)) {
          setPreviewUrl(data.url);
        } else {
          setPreviewUrl('');
        }
        setLocalBlobUrl(null);

        // Revoke blob now that we have the real URL
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }

        onChange(data.url, dimensions?.width, dimensions?.height);
        toast.success('Image uploaded to Cloudinary');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
      toast.error(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setUploadError(null);
    handleUpload();
  };

  const clearAll = () => {
    setLinkInput('');
    setPreviewUrl('');
    setDimensions(null);
    setLinkError(null);
    setSelectedFile(null);
    setLocalBlobUrl(null);
    setUploadError(null);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange('', undefined, undefined);
  };

  const activePreview = localBlobUrl || previewUrl;

  const safeSrc = useMemo(() => {
    if (!activePreview) return null;
    if (activePreview.startsWith('blob:')) return activePreview; // our own createObjectURL, not user input
    try {
      const parsed = new URL(activePreview);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return activePreview;
      }
    } catch {}
    return null;
  }, [activePreview]);

  const goodRatio = dimensions ? isGoodSocialRatio(dimensions.width, dimensions.height) : null;

  return (
    <div className="space-y-3">
      {/* Recommended size hint */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>Image source:</span>
        <span className="text-accent font-semibold">Recommended size: 1200×630 (16:9 Landscape)</span>
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-md overflow-hidden border border-border">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            mode === 'link'
              ? 'bg-accent text-white'
              : 'bg-bg-secondary text-text-tertiary hover:text-white'
          }`}
        >
          <LinkIcon className="w-3 h-3" />
          Paste Link
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            mode === 'upload'
              ? 'bg-accent text-white'
              : 'bg-bg-secondary text-text-tertiary hover:text-white'
          }`}
        >
          <Upload className="w-3 h-3" />
          Upload File
        </button>
      </div>

      {/* Link mode */}
      {mode === 'link' && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={linkInput}
              onChange={handleLinkChange}
              onBlur={handleLinkBlur}
              placeholder="https://res.cloudinary.com/..."
              className={`w-full bg-bg-secondary border rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-accent pr-8 transition-colors ${
                linkError ? 'border-red-500/60' : 'border-border'
              }`}
            />
            {isProbing && (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin" />
              </div>
            )}
          </div>
          {linkError && (
            <p className="flex items-start gap-1.5 text-[10px] text-red-400">
              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
              {linkError}
            </p>
          )}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            id="cover-image-file-input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={handleFileSelect}
            className="w-full bg-bg-secondary border border-border rounded-md px-3 py-2 text-xs text-white file:bg-accent file:border-none file:text-white file:px-2 file:py-1 file:rounded file:mr-3 file:cursor-pointer file:text-xs"
          />
          <div className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">
              Upload Folder
            </label>
            <CloudFolderSelect
              value={uploadFolder}
              onChange={setUploadFolder}
              defaultFolder="warishlabs/blog"
            />
          </div>

          {selectedFile && !isUploading && !uploadError && (
            <button
              type="button"
              onClick={handleUpload}
              className="w-full bg-accent/20 hover:bg-accent/30 border border-accent/40 text-accent text-xs font-semibold uppercase tracking-wider py-2 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload to Cloudinary
            </button>
          )}

          {isUploading && (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-text-secondary">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent" />
              Uploading to Cloudinary...
            </div>
          )}

          {uploadError && (
            <div className="flex items-center justify-between gap-2 bg-red-950/30 border border-red-500/20 rounded-md px-3 py-2">
              <p className="text-[10px] text-red-400 flex-1">{uploadError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-[10px] font-semibold text-accent hover:underline shrink-0"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Preview card */}
      {safeSrc && (
        <div className="relative rounded-lg overflow-hidden border border-border bg-black/40">
          {localBlobUrl ? (
            /* 
              Safe case: raw <img> is used ONLY for local browser-generated blob: URLs.
              These URLs are created locally via URL.createObjectURL from a File selected
              by the user. This is same-origin, not user-controlled string input, and
              these blob URLs are revoked on cleanup/unmount.
            */
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localBlobUrl}
              alt="Local upload preview"
              className="w-full max-h-48 object-contain bg-black/60"
            />
          ) : (
            <Image
              src={safeSrc}
              alt="Cover image preview"
              width={dimensions?.width ?? 400}
              height={dimensions?.height ?? 200}
              className="w-full max-h-48 object-contain bg-black/60"
            />
          )}
          {localBlobUrl && (
            <div className="absolute top-2 left-2 bg-amber-500/90 text-black text-[9px] font-bold uppercase px-2 py-0.5 rounded">
              Local Preview
            </div>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1 rounded transition-colors"
            title="Clear image"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dimension helper */}
      {dimensions && (
        <div
          className={`flex items-start gap-1.5 text-[10px] rounded px-2 py-1.5 ${
            goodRatio
              ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-400'
              : 'bg-amber-950/30 border border-amber-500/20 text-amber-400'
          }`}
        >
          {goodRatio ? (
            <CheckCircle className="w-3 h-3 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
          )}
          <span>
            Current: {dimensions.width}×{dimensions.height} ({getAspectRatio(dimensions.width, dimensions.height)})
            {!goodRatio && ' — Recommended: 1200×630 (1.91:1) for social/OG previews'}
          </span>
        </div>
      )}

      {!activePreview && (
        <div className="flex items-center justify-center gap-2 h-24 rounded-lg border border-dashed border-border/60 text-text-tertiary">
          <ImageIcon className="w-4 h-4" />
          <span className="text-xs">No image selected — preview appears here</span>
        </div>
      )}
    </div>
  );
}

export default BlogCoverImageField;

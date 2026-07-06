import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Module-level mock for cloudinary ────────────────────────────────────────
// vi.mock is hoisted to the top by Vitest. To avoid "Cannot access before
// initialization" errors, we must NOT reference outer vi.fn() variables inside
// the factory. Instead, define mocks inside the factory using vi.fn() directly
// and expose them via a module-level object that gets populated lazily.

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    api: {
      root_folders: vi.fn(),
      sub_folders: vi.fn(),
      resources: vi.fn(),
    },
    uploader: {
      upload_stream: vi.fn(),
      destroy: vi.fn(),
    },
  },
}));

// Set env vars BEFORE importing so `isConfigured` evaluates to true
vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'test-cloud');
vi.stubEnv('CLOUDINARY_API_KEY', 'test-key');
vi.stubEnv('CLOUDINARY_API_SECRET', 'test-secret');

// Import AFTER mocks are set up
import { MediaService } from '@/services/MediaService';
// Import the mocked cloudinary to access its spy functions
import { v2 as cloudinary } from 'cloudinary';

// Typed references to mocked API methods
const mockRootFolders = cloudinary.api.root_folders as ReturnType<typeof vi.fn>;
const mockSubFolders = cloudinary.api.sub_folders as ReturnType<typeof vi.fn>;
const mockResources = cloudinary.api.resources as ReturnType<typeof vi.fn>;
const mockDestroy = cloudinary.uploader.destroy as ReturnType<typeof vi.fn>;

describe('MediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── listFolders ──────────────────────────────────────────────────────────
  describe('listFolders', () => {
    it('calls root_folders when no parentPath is given', async () => {
      mockRootFolders.mockResolvedValueOnce({
        folders: [{ name: 'warishlabs', path: 'warishlabs' }],
      });

      const result = await MediaService.listFolders();

      expect(mockRootFolders).toHaveBeenCalledTimes(1);
      expect(result).toEqual([{ name: 'warishlabs', path: 'warishlabs' }]);
    });

    it('calls sub_folders when a parentPath is given', async () => {
      mockSubFolders.mockResolvedValueOnce({
        folders: [
          { name: 'products', path: 'warishlabs/products' },
          { name: 'blog', path: 'warishlabs/blog' },
        ],
      });

      const result = await MediaService.listFolders('warishlabs');

      expect(mockSubFolders).toHaveBeenCalledWith('warishlabs');
      expect(result).toHaveLength(2);
      expect(result[0].path).toBe('warishlabs/products');
    });

    it('returns an empty array when Cloudinary throws', async () => {
      mockRootFolders.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await MediaService.listFolders();
      expect(result).toEqual([]);
    });
  });

  // ── walkAllFolders ───────────────────────────────────────────────────────
  describe('walkAllFolders', () => {
    it('recursively walks a 2-level folder tree', async () => {
      // Root returns one top-level folder
      mockRootFolders.mockResolvedValueOnce({
        folders: [{ name: 'warishlabs', path: 'warishlabs' }],
      });

      // Level 1 under 'warishlabs': two sub-folders
      mockSubFolders
        .mockResolvedValueOnce({
          folders: [
            { name: 'products', path: 'warishlabs/products' },
            { name: 'blog', path: 'warishlabs/blog' },
          ],
        })
        // Level 2 under 'warishlabs/products': empty
        .mockResolvedValueOnce({ folders: [] })
        // Level 2 under 'warishlabs/blog': empty
        .mockResolvedValueOnce({ folders: [] });

      const result = await MediaService.walkAllFolders();

      // Should contain: warishlabs, warishlabs/products, warishlabs/blog
      expect(result).toHaveLength(3);
      const paths = result.map((f) => f.path);
      expect(paths).toContain('warishlabs');
      expect(paths).toContain('warishlabs/products');
      expect(paths).toContain('warishlabs/blog');
    });

    it('returns an empty array when root has no folders', async () => {
      mockRootFolders.mockResolvedValueOnce({ folders: [] });

      const result = await MediaService.walkAllFolders();
      expect(result).toEqual([]);
      expect(mockSubFolders).not.toHaveBeenCalled();
    });

    it('handles sub_folder errors gracefully and returns partial results', async () => {
      mockRootFolders.mockResolvedValueOnce({
        folders: [{ name: 'warishlabs', path: 'warishlabs' }],
      });
      // Sub-folders call fails
      mockSubFolders.mockRejectedValueOnce(new Error('Cloudinary API error'));

      // Should not throw, returns just the root folder (sub-walk returns [])
      const result = await MediaService.walkAllFolders();
      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('warishlabs');
    });
  });

  // ── deleteAsset ──────────────────────────────────────────────────────────
  describe('deleteAsset', () => {
    it('returns true when Cloudinary destroy succeeds', async () => {
      mockDestroy.mockResolvedValueOnce({ result: 'ok' });

      const result = await MediaService.deleteAsset('warishlabs/products/my-image');
      expect(result).toBe(true);
      expect(mockDestroy).toHaveBeenCalledWith('warishlabs/products/my-image');
    });

    it('returns false when Cloudinary destroy does not return ok', async () => {
      mockDestroy.mockResolvedValueOnce({ result: 'not found' });

      const result = await MediaService.deleteAsset('warishlabs/products/ghost');
      expect(result).toBe(false);
    });

    it('returns false when Cloudinary destroy throws', async () => {
      mockDestroy.mockRejectedValueOnce(new Error('Cloudinary error'));

      const result = await MediaService.deleteAsset('warishlabs/products/bad-id');
      expect(result).toBe(false);
    });

    it('returns true immediately for mock_ publicIds without calling Cloudinary', async () => {
      const result = await MediaService.deleteAsset('mock_1234_test_image_png');
      expect(result).toBe(true);
      expect(mockDestroy).not.toHaveBeenCalled();
    });
  });

  // ── listFolderAssets ──────────────────────────────────────────────────────
  describe('listFolderAssets', () => {
    it('returns mapped asset metadata from Cloudinary resources', async () => {
      mockResources.mockResolvedValueOnce({
        resources: [
          {
            public_id: 'warishlabs/blog/hero-image',
            secure_url: 'https://res.cloudinary.com/test/image/upload/warishlabs/blog/hero-image.jpg',
            width: 1200,
            height: 630,
            bytes: 204800,
            format: 'jpg',
            created_at: '2026-07-01T10:00:00Z',
          },
        ],
      });

      const result = await MediaService.listFolderAssets('warishlabs/blog');

      expect(result).toHaveLength(1);
      expect(result[0].publicId).toBe('warishlabs/blog/hero-image');
      expect(result[0].width).toBe(1200);
      expect(result[0].height).toBe(630);
      expect(result[0].bytes).toBe(204800);
      expect(result[0].fileName).toBe('hero-image');
    });

    it('returns empty array on Cloudinary error', async () => {
      mockResources.mockRejectedValueOnce(new Error('Rate limited'));

      const result = await MediaService.listFolderAssets('warishlabs/blog');
      expect(result).toEqual([]);
    });
  });

  // ── getPublicIdFromUrl ────────────────────────────────────────────────────
  describe('getPublicIdFromUrl', () => {
    it('extracts publicId from a standard Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/mycloud/image/upload/warishlabs/products/banner.png';
      expect(MediaService.getPublicIdFromUrl(url)).toBe('warishlabs/products/banner');
    });

    it('strips version parameter from Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/mycloud/image/upload/v1718293000/warishlabs/products/logo.jpg';
      expect(MediaService.getPublicIdFromUrl(url)).toBe('warishlabs/products/logo');
    });

    it('returns null for non-Cloudinary URLs', () => {
      expect(MediaService.getPublicIdFromUrl('https://example.com/image.png')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(MediaService.getPublicIdFromUrl('')).toBeNull();
    });
  });
});

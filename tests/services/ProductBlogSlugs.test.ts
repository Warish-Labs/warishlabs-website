import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService, ProductWithDetails } from '@/services/ProductService';
import { BlogService, BlogWithDetails } from '@/services/BlogService';
import prisma from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      product: {
        findUnique: vi.fn(),
      },
      blog: {
        findUnique: vi.fn(),
      },
    },
    prisma: {
      product: {
        findUnique: vi.fn(),
      },
      blog: {
        findUnique: vi.fn(),
      },
    },
  };
});

describe('ProductService & BlogService Slugs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ProductService.getBySlug', () => {
    it('returns a product when the database query succeeds and findUnique returns product', async () => {
      const mockProduct = { id: '1', name: 'Cloud Platform', slug: 'warishlabs-cloud' };
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct as unknown as ProductWithDetails);

      const result = await ProductService.getBySlug('warishlabs-cloud');
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'warishlabs-cloud' } })
      );
    });

    it('returns null when product is not found in database', async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await ProductService.getBySlug('non-existent');
      expect(result).toBeNull();
    });

    it('propagates the database error when query fails', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(prisma.product.findUnique).mockRejectedValue(dbError);

      await expect(ProductService.getBySlug('fail-slug')).rejects.toThrow('Database connection failed');
    });
  });

  describe('BlogService.getBySlug', () => {
    it('returns a blog post when the database query succeeds and findUnique returns post', async () => {
      const mockPost = { id: 'b1', title: 'WebGL Optimize', slug: 'webgl-particle-optimization' };
      vi.mocked(prisma.blog.findUnique).mockResolvedValue(mockPost as unknown as BlogWithDetails);

      const result = await BlogService.getBySlug('webgl-particle-optimization');
      expect(result).toEqual(mockPost);
      expect(prisma.blog.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'webgl-particle-optimization' } })
      );
    });

    it('returns null when blog post is not found in database', async () => {
      vi.mocked(prisma.blog.findUnique).mockResolvedValue(null);

      const result = await BlogService.getBySlug('non-existent-blog');
      expect(result).toBeNull();
    });

    it('propagates the database error when query fails', async () => {
      const dbError = new Error('Database connection failed');
      vi.mocked(prisma.blog.findUnique).mockRejectedValue(dbError);

      await expect(BlogService.getBySlug('fail-blog')).rejects.toThrow('Database connection failed');
    });
  });
});

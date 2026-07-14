import prisma from '@/lib/prisma';
import type { Product, Category, ProductMedia, ProductFAQ, ProductSEO } from '@prisma/client';
import { MediaService } from './MediaService';

export type ProductWithDetails = Product & {
  category: Category;
  media: ProductMedia[];
  faqs: ProductFAQ[];
  seo: ProductSEO | null;
};

export class ProductService {
  /**
   * Retrieves all products with basic relations (active only by default)
   */
  static async getAll(activeOnly = true): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      where: activeOnly ? { status: 'active' } : undefined,
      include: {
        category: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
        seo: true,
      },
      orderBy: { createdAt: 'desc' },
    }).catch(() => []) as unknown as ProductWithDetails[];
  }

  /**
   * Retrieves popular products ordered by clicks first, then created date
   */
  static async getPopularProducts(limit = 8): Promise<ProductWithDetails[]> {
    return prisma.product.findMany({
      where: { status: 'active' },
      include: {
        category: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
        seo: true,
      },
      orderBy: [
        { clickCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
    }).catch(() => []) as unknown as ProductWithDetails[];
  }

  /**
   * Retrieves a single product by its unique slug
   */
  static async getBySlug(slug: string): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
        seo: true,
      },
    }) as unknown as ProductWithDetails | null;
  }

  /**
   * Increments the page view count of a product
   */
  static async incrementViewCount(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  /**
   * Increments the click count of a product
   */
  static async incrementClickCount(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { clickCount: { increment: 1 } },
    });
  }

  /**
   * Admin: Creates a new product with relations
   */
  static async create(data: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    status: string;
    type?: string;
    githubUrl?: string | null;
    visitUrl?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    featured?: boolean;
    showOnHomepage?: boolean;
    displayOrder?: number;
    categoryId: string;
    media?: { url: string; type: string; alt?: string; sortOrder?: number }[];
    faqs?: { question: string; answer: string; sortOrder?: number }[];
    seo?: { title: string; description: string; keywords?: string } | null;
  }): Promise<Product> {
    const { media = [], faqs = [], seo, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Create product
      const product = await tx.product.create({
        data: {
          ...productData,
          media: {
            create: media,
          },
          faqs: {
            create: faqs,
          },
        },
      });

      // 2. Create SEO
      if (seo) {
        await tx.productSEO.create({
          data: {
            productId: product.id,
            title: seo.title,
            description: seo.description,
            keywords: seo.keywords,
          },
        });
      }

      return product;
    });
  }

  /**
   * Admin: Updates an existing product details and links
   */
  static async update(
    id: string,
    data: {
      name?: string;
      slug?: string;
      tagline?: string;
      description?: string;
      status?: string;
      type?: string;
      githubUrl?: string | null;
      visitUrl?: string | null;
      logoUrl?: string | null;
      bannerUrl?: string | null;
      featured?: boolean;
      showOnHomepage?: boolean;
      displayOrder?: number;
      categoryId?: string;
      media?: { url: string; type: string; alt?: string; sortOrder?: number }[];
      faqs?: { question: string; answer: string; sortOrder?: number }[];
      seo?: { title: string; description: string; keywords?: string } | null;
    }
  ): Promise<Product> {
    const { media, faqs, seo, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Update Media if provided
      if (media !== undefined) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
        if (media.length > 0) {
          await tx.productMedia.createMany({
            data: media.map((item) => ({
              productId: id,
              ...item,
            })),
          });
        }
      }

      // 3. Update FAQs if provided
      if (faqs !== undefined) {
        await tx.productFAQ.deleteMany({ where: { productId: id } });
        if (faqs.length > 0) {
          await tx.productFAQ.createMany({
            data: faqs.map((item) => ({
              productId: id,
              ...item,
            })),
          });
        }
      }

      // 4. Update SEO if provided
      if (seo !== undefined) {
        await tx.productSEO.deleteMany({ where: { productId: id } });
        if (seo) {
          await tx.productSEO.create({
            data: {
              productId: id,
              title: seo.title,
              description: seo.description,
              keywords: seo.keywords,
            },
          });
        }
      }

      return product;
    });
  }

  static async delete(id: string): Promise<boolean> {
    try {
      // 1. Fetch associated media first to get Cloudinary URLs
      const product = await prisma.product.findUnique({
        where: { id },
        include: { media: true },
      });

      if (product) {
        // Delete logo from Cloudinary if it exists
        if (product.logoUrl) {
          const logoPublicId = MediaService.getPublicIdFromUrl(product.logoUrl);
          if (logoPublicId) {
            await MediaService.deleteAsset(logoPublicId);
          }
        }

        if (product.media.length > 0) {
          // 2. Call deleteAsset for each media URL
          for (const item of product.media) {
            const publicId = MediaService.getPublicIdFromUrl(item.url);
            if (publicId) {
              await MediaService.deleteAsset(publicId);
            }
          }
        }
      }

      // 3. Delete the product DB record (which cascades to media, faqs, seo, etc.)
      await prisma.product.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`[ProductService] Failed to delete product ${id}:`, error);
      return false;
    }
  }
}

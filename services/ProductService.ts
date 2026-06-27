import prisma from '@/lib/prisma';
import type { Product, Category, Technology, ProductMedia, ProductFAQ, ProductSEO } from '@prisma/client';

export type ProductWithDetails = Product & {
  category: Category;
  technologies: { technology: Technology }[];
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
        technologies: {
          include: { technology: true },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        faqs: {
          orderBy: { sortOrder: 'asc' },
        },
        seo: true,
      },
      orderBy: { createdAt: 'desc' },
    }) as unknown as ProductWithDetails[];
  }

  /**
   * Retrieves a single product by its unique slug
   */
  static async getBySlug(slug: string): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        technologies: {
          include: { technology: true },
        },
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
   * Admin: Creates a new product with relations
   */
  static async create(data: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    status: string;
    githubUrl?: string | null;
    visitUrl?: string | null;
    categoryId: string;
    technologyIds?: string[];
    media?: { url: string; type: string; alt?: string; sortOrder?: number }[];
    faqs?: { question: string; answer: string; sortOrder?: number }[];
    seo?: { title: string; description: string; keywords?: string } | null;
  }): Promise<Product> {
    const { technologyIds = [], media = [], faqs = [], seo, ...productData } = data;

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

      // 2. Link Technologies
      if (technologyIds.length > 0) {
        await tx.productTechnology.createMany({
          data: technologyIds.map((techId) => ({
            productId: product.id,
            technologyId: techId,
          })),
        });
      }

      // 3. Create SEO
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
      githubUrl?: string | null;
      visitUrl?: string | null;
      categoryId?: string;
      technologyIds?: string[];
      media?: { url: string; type: string; alt?: string; sortOrder?: number }[];
      faqs?: { question: string; answer: string; sortOrder?: number }[];
      seo?: { title: string; description: string; keywords?: string } | null;
    }
  ): Promise<Product> {
    const { technologyIds, media, faqs, seo, ...productData } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      const product = await tx.product.update({
        where: { id },
        data: productData,
      });

      // 2. Update Technologies if provided
      if (technologyIds !== undefined) {
        // Clear existing links
        await tx.productTechnology.deleteMany({ where: { productId: id } });
        // Add new links
        if (technologyIds.length > 0) {
          await tx.productTechnology.createMany({
            data: technologyIds.map((techId) => ({
              productId: id,
              technologyId: techId,
            })),
          });
        }
      }

      // 3. Update Media if provided
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

      // 4. Update FAQs if provided
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

      // 5. Update SEO if provided
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

  /**
   * Admin: Deletes a product (cascade delete for media, faqs, tech links, and seo)
   */
  static async delete(id: string): Promise<boolean> {
    try {
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

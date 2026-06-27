import prisma from '@/lib/prisma';
import type { Blog, BlogSEO } from '@prisma/client';

export type BlogWithDetails = Blog & {
  seo: BlogSEO | null;
};

export class BlogService {
  /**
   * Retrieves all blogs, filtered by publication status
   */
  static async getAll(publishedOnly = true): Promise<BlogWithDetails[]> {
    return prisma.blog.findMany({
      where: publishedOnly ? { published: true } : undefined,
      include: { seo: true },
      orderBy: { publishedAt: 'desc' },
    }) as unknown as BlogWithDetails[];
  }

  /**
   * Retrieves a single blog post by its unique slug
   */
  static async getBySlug(slug: string): Promise<BlogWithDetails | null> {
    return prisma.blog.findUnique({
      where: { slug },
      include: { seo: true },
    }) as unknown as BlogWithDetails | null;
  }

  /**
   * Admin: Creates a new blog post
   */
  static async create(data: {
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    coverImage?: string | null;
    category: string;
    published?: boolean;
    publishedAt?: Date | null;
    seo?: { title: string; description: string; keywords?: string } | null;
  }): Promise<Blog> {
    const { seo, ...blogData } = data;

    return prisma.$transaction(async (tx) => {
      const blog = await tx.blog.create({
        data: {
          ...blogData,
          publishedAt: blogData.published ? (blogData.publishedAt || new Date()) : null,
        },
      });

      if (seo) {
        await tx.blogSEO.create({
          data: {
            blogId: blog.id,
            title: seo.title,
            description: seo.description,
            keywords: seo.keywords,
          },
        });
      }

      return blog;
    });
  }

  /**
   * Admin: Updates an existing blog post
   */
  static async update(
    id: string,
    data: {
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      coverImage?: string | null;
      category?: string;
      published?: boolean;
      publishedAt?: Date | null;
      seo?: { title: string; description: string; keywords?: string } | null;
    }
  ): Promise<Blog> {
    const { seo, ...blogData } = data;

    return prisma.$transaction(async (tx) => {
      // Manage publishedAt state changes
      let updatedPublishedAt = blogData.publishedAt;
      if (blogData.published !== undefined) {
        if (blogData.published) {
          const current = await tx.blog.findUnique({ where: { id } });
          updatedPublishedAt = current?.publishedAt || new Date();
        } else {
          updatedPublishedAt = null;
        }
      }

      const blog = await tx.blog.update({
        where: { id },
        data: {
          ...blogData,
          publishedAt: updatedPublishedAt,
        },
      });

      if (seo !== undefined) {
        await tx.blogSEO.deleteMany({ where: { blogId: id } });
        if (seo) {
          await tx.blogSEO.create({
            data: {
              blogId: id,
              title: seo.title,
              description: seo.description,
              keywords: seo.keywords,
            },
          });
        }
      }

      return blog;
    });
  }

  /**
   * Admin: Deletes a blog post
   */
  static async delete(id: string): Promise<boolean> {
    try {
      await prisma.blog.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error(`[BlogService] Failed to delete blog ${id}:`, error);
      return false;
    }
  }
}

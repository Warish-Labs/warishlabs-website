import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface StaticPage {
  id: string;
  name: string;
  path: string;
  description: string;
  keywords: string;
}

const STATIC_PAGES: StaticPage[] = [
  {
    id: 'page-home',
    name: 'Homepage',
    path: '/',
    description: 'WarishLabs main homepage, showcase, and engineering bulletins.',
    keywords: 'home, homepage, main, index, warishlabs',
  },
  {
    id: 'page-products',
    name: 'Explore Products',
    path: '/products',
    description: 'Product catalog of laboratory software platforms, distributed scheduler engine, and developer tools.',
    keywords: 'products, console, catalog, software, tools, scheduler, antigravity, cloud',
  },
  {
    id: 'page-labs',
    name: 'Labs Sandbox',
    path: '/labs',
    description: 'Experimental sandbox for prototypes, visual web experiments, and WebGL concepts.',
    keywords: 'labs, sandbox, prototype, experiments, webgl, canvas, three.js, graphics',
  },
  {
    id: 'page-categories',
    name: 'Categories Catalog',
    path: '/categories',
    description: 'Categories and technology segments of showcased platforms and labs.',
    keywords: 'categories, technology, segments, tags, landscape',
  },
  {
    id: 'page-blog',
    name: 'Blog Articles',
    path: '/blog',
    description: 'Engineering blog with deep dives on software architecture, high-performance distributed systems, and web graphics.',
    keywords: 'blog, articles, engineering, read, posts, journal, bulletins',
  },
  {
    id: 'page-about',
    name: 'About Lab',
    path: '/about',
    description: 'About WarishLabs software laboratory, philosophy, team, and engineering vision.',
    keywords: 'about, lab, philosophy, vision, team, warish, ansari',
  },
  {
    id: 'page-contact',
    name: 'Contact Engineering',
    path: '/contact',
    description: 'Contact WarishLabs direct transmission lines, send secure messages or technical inquiries.',
    keywords: 'contact, email, support, touch, secure, message, map',
  },
];

function calculateRelevance(
  query: string,
  name: string,
  slugOrPath: string,
  tagline: string = '',
  description: string = '',
  categoryName: string = '',
  tags: string[] = [],
  keywords: string = ''
): number {
  const normName = name.toLowerCase();
  const normSlug = slugOrPath.toLowerCase();
  const normTagline = tagline.toLowerCase();
  const normDesc = description.toLowerCase();
  const normCat = categoryName.toLowerCase();
  const normKeywords = keywords.toLowerCase();
  const normTags = tags.map((t) => t.toLowerCase());

  let score = 0;

  // 1. Exact match on name/title
  if (normName === query) {
    score += 100;
  }
  // 2. Exact match on slug/path
  else if (normSlug === query) {
    score += 90;
  }
  // 3. Prefix match on name/title
  else if (normName.startsWith(query)) {
    score += 80;
  }
  // 4. Exact match on tags or keywords
  else if (normTags.includes(query) || normKeywords.split(',').map((k) => k.trim()).includes(query)) {
    score += 70;
  }
  // 5. Substring match on name/title
  else if (normName.includes(query)) {
    score += 50;
  }
  // 6. Substring match on tagline/slug/category
  else if (normTagline.includes(query) || normSlug.includes(query) || normCat.includes(query)) {
    score += 40;
  }
  // 7. Substring match on description/content/keywords
  else if (normDesc.includes(query) || normKeywords.includes(query) || normTags.some((t) => t.includes(query))) {
    score += 30;
  }

  return score;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';

    // Normalize: lowercase, trim, remove duplicate spaces
    const query = q.toLowerCase().trim().replace(/\s+/g, ' ');

    if (!query) {
      return NextResponse.json({
        success: true,
        products: [],
        categories: [],
        labs: [],
        blogs: [],
        pages: [],
      });
    }

    // Query databases in parallel for candidates
    const [dbProducts, dbCategories, dbLabs, dbBlogs] = await Promise.all([
      // 1. Products - Active & Beta
      prisma.product.findMany({
        where: {
          status: { in: ['active', 'beta'] },
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { tagline: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
            { technologies: { some: { technology: { name: { contains: query, mode: 'insensitive' } } } } },
            { seo: { title: { contains: query, mode: 'insensitive' } } },
            { seo: { description: { contains: query, mode: 'insensitive' } } },
            { seo: { keywords: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          category: true,
          technologies: { include: { technology: true } },
          seo: true,
        },
      }).catch((err) => {
        console.error('Products search DB query error:', err);
        return [];
      }),

      // 2. Categories
      prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { seo: { title: { contains: query, mode: 'insensitive' } } },
            { seo: { description: { contains: query, mode: 'insensitive' } } },
            { seo: { keywords: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          seo: true,
        },
      }).catch((err) => {
        console.error('Categories search DB query error:', err);
        return [];
      }),

      // 3. Labs - All statuses (active/completed/deprecated)
      prisma.lab.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { techStack: { contains: query, mode: 'insensitive' } },
          ],
        },
      }).catch((err) => {
        console.error('Labs search DB query error:', err);
        return [];
      }),

      // 4. Blogs - Published
      prisma.blog.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { slug: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
            { seo: { title: { contains: query, mode: 'insensitive' } } },
            { seo: { description: { contains: query, mode: 'insensitive' } } },
            { seo: { keywords: { contains: query, mode: 'insensitive' } } },
          ],
        },
        include: {
          seo: true,
        },
      }).catch((err) => {
        console.error('Blogs search DB query error:', err);
        return [];
      }),
    ]);

    // --- Process and Rank Products ---
    const products = dbProducts
      .map((p) => {
        const techNames = p.technologies.map((t) => t.technology.name);
        const keywordsStr = p.seo?.keywords || '';
        const score = calculateRelevance(
          query,
          p.name,
          p.slug,
          p.tagline,
          p.description,
          p.category.name,
          techNames,
          keywordsStr
        );
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          tagline: p.tagline,
          score,
        };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name); // stable ordering
      });

    // --- Process and Rank Categories ---
    const categories = dbCategories
      .map((c) => {
        const keywordsStr = c.seo?.keywords || '';
        const score = calculateRelevance(
          query,
          c.name,
          c.slug,
          '',
          c.description || '',
          '',
          [],
          keywordsStr
        );
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          score,
        };
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });

    // --- Process and Rank Labs ---
    const labs = dbLabs
      .map((l) => {
        const tags = l.techStack ? l.techStack.split(',').map((t) => t.trim()) : [];
        const score = calculateRelevance(
          query,
          l.name,
          l.slug,
          '',
          l.description,
          '',
          tags,
          ''
        );
        return {
          id: l.id,
          name: l.name,
          slug: l.slug,
          score,
        };
      })
      .filter((l) => l.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });

    // --- Process and Rank Blogs ---
    const blogs = dbBlogs
      .map((b) => {
        const keywordsStr = b.seo?.keywords || '';
        const score = calculateRelevance(
          query,
          b.title,
          b.slug,
          b.excerpt,
          b.content,
          b.category,
          [],
          keywordsStr
        );
        return {
          id: b.id,
          title: b.title,
          slug: b.slug,
          score,
        };
      })
      .filter((b) => b.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.title.localeCompare(b.title);
      });

    // --- Process and Rank Static Pages ---
    const pages = STATIC_PAGES.map((page) => {
      const score = calculateRelevance(
        query,
        page.name,
        page.path,
        '',
        page.description,
        '',
        [],
        page.keywords
      );
      return {
        id: page.id,
        name: page.name,
        path: page.path,
        description: page.description,
        score,
      };
    })
      .filter((p) => p.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      success: true,
      products,
      categories,
      labs,
      blogs,
      pages,
    });
  } catch (error) {
    console.error('[API Search] Search handler failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

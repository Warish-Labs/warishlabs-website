// Type-safe route paths for navigation and linking

export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (slug: string) => `/products/${slug}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}`,
  BLOG: '/blog',
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  LABS: '/labs',
  OPEN_SOURCE: '/open-source',
  ABOUT: '/about',
  CONTACT: '/contact',
  SEARCH: '/search',
  
  // Admin Routes
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_HOMEPAGE: '/admin/homepage',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_TECHNOLOGIES: '/admin/technologies',
  ADMIN_BLOG: '/admin/blog',
  ADMIN_LABS: '/admin/labs',
  ADMIN_OPEN_SOURCE: '/admin/open-source',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_MESSAGES: '/admin/messages',
  ADMIN_NEWSLETTER: '/admin/newsletter',
  ADMIN_FAQS: '/admin/faqs',
  ADMIN_NAVIGATION: '/admin/navigation',
  ADMIN_SEO: '/admin/seo',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_VISITORS: '/admin/visitors',
  ADMIN_ACTIVITY_LOGS: '/admin/activity-logs',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_SYSTEM: '/admin/system',
} as const;

export type RoutePath = typeof ROUTES[keyof Omit<typeof ROUTES, 'PRODUCT_DETAIL' | 'CATEGORY_DETAIL' | 'BLOG_DETAIL'>];
export type AppRoute = string;

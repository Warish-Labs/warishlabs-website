import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Site Settings
  const settings = [
    { id: 'site_name', value: 'WarishLabs' },
    { id: 'site_description', value: 'Seriousness in Engineering, Modern Product Thinking.' },
    { id: 'contact_email', value: 'hello@warishlabs.com' },
    { id: 'maintenance_mode', value: 'false' },
    { id: 'cursor_glow_enabled', value: 'true' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { id: setting.id },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('Site settings seeded.');

  // 2. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'warishlabs@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Warish@786';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: { passwordHash: hashedPassword },
    create: {
      email: adminEmail,
      name: 'Warish Labs Admin',
      passwordHash: hashedPassword,
    },
  });
  console.log(`Admin user seeded: ${admin.email}`);

  // 3. Seed Categories
  const categories = [
    { name: 'Core Platform', slug: 'core-platform', description: 'Enterprise-grade foundational platforms.' },
    { name: 'AI & Data', slug: 'ai-data', description: 'Intelligent systems and analytics infrastructure.' },
    { name: 'Developer Tools', slug: 'developer-tools', description: 'Tools that boost builder velocity.' },
  ];

  const seededCategories = [];
  for (const cat of categories) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    seededCategories.push(c);
  }
  console.log('Categories seeded.');

  // 4. Seed Technologies
  const techs = [
    { name: 'Next.js', slug: 'nextjs', icon: 'nextjs' },
    { name: 'TypeScript', slug: 'typescript', icon: 'typescript' },
    { name: 'PostgreSQL', slug: 'postgresql', icon: 'postgresql' },
    { name: 'Prisma', slug: 'prisma', icon: 'prisma' },
    { name: 'Tailwind CSS', slug: 'tailwindcss', icon: 'tailwindcss' },
    { name: 'Three.js', slug: 'threejs', icon: 'threejs' },
    { name: 'Zustand', slug: 'zustand', icon: 'zustand' },
    { name: 'Framer Motion', slug: 'framer-motion', icon: 'framer-motion' },
  ];

  const seededTechs: Record<string, any> = {};
  for (const tech of techs) {
    const t = await prisma.technology.upsert({
      where: { slug: tech.slug },
      update: { name: tech.name, icon: tech.icon },
      create: tech,
    });
    seededTechs[t.slug] = t;
  }
  console.log('Technologies seeded.');

  // 5. Seed Products
  const products = [
    {
      name: 'WarishLabs Cloud',
      slug: 'warishlabs-cloud',
      tagline: 'High-velocity host for modern full-stack systems.',
      description: '<h2>The High-Velocity Host for Modern Apps</h2><p>WarishLabs Cloud delivers global edge latency, automated builds, and serverless database integration out of the box. Designed for teams who build software that cannot afford downtime.</p>',
      status: 'active',
      githubUrl: 'https://github.com/warishlabs/cloud',
      visitUrl: 'https://cloud.warishlabs.com',
      categoryId: seededCategories[0].id,
      techSlugs: ['nextjs', 'typescript', 'postgresql', 'prisma', 'tailwindcss'],
    },
    {
      name: 'Antigravity Engine',
      slug: 'antigravity-engine',
      tagline: 'Deterministic workflow scheduler with 3D canvas builder.',
      description: '<h2>Build Workflows in 3D Space</h2><p>A high-performance state machine scheduler providing precise execution guarantees, live visualization, and visual debugging via a Canvas-based 3D workspace. Boosts complex task runner observability to 100%.</p>',
      status: 'beta',
      githubUrl: 'https://github.com/warishlabs/antigravity',
      visitUrl: null,
      categoryId: seededCategories[1].id,
      techSlugs: ['threejs', 'typescript', 'zustand', 'framer-motion', 'nextjs'],
    },
  ];

  for (const prod of products) {
    const { techSlugs, ...prodData } = prod;
    
    const p = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {
        name: prodData.name,
        tagline: prodData.tagline,
        description: prodData.description,
        status: prodData.status,
        githubUrl: prodData.githubUrl,
        visitUrl: prodData.visitUrl,
        categoryId: prodData.categoryId,
      },
      create: prodData,
    });

    // Link Technologies
    for (const slug of techSlugs) {
      const tech = seededTechs[slug];
      if (tech) {
        await prisma.productTechnology.upsert({
          where: {
            productId_technologyId: {
              productId: p.id,
              technologyId: tech.id,
            },
          },
          update: {},
          create: {
            productId: p.id,
            technologyId: tech.id,
          },
        });
      }
    }
  }
  console.log('Products seeded.');

  // 6. Seed Nav Items
  const navItems = [
    { label: 'Products', path: '/products', sortOrder: 1 },
    { label: 'Labs', path: '/labs', sortOrder: 2 },
    { label: 'Open Source', path: '/open-source', sortOrder: 3 },
    { label: 'Blog', path: '/blog', sortOrder: 4 },
    { label: 'About', path: '/about', sortOrder: 5 },
    { label: 'Contact', path: '/contact', sortOrder: 6 },
  ];

  for (const item of navItems) {
    await prisma.navItem.upsert({
      // We can use a find/upsert strategy based on path
      where: { id: item.path }, // Mock identifier or find first
      update: { label: item.label, sortOrder: item.sortOrder },
      create: { id: item.path, label: item.label, path: item.path, sortOrder: item.sortOrder },
    }).catch(async () => {
      // If table id matches uuid type, create it normally
      const exists = await prisma.navItem.findFirst({ where: { path: item.path } });
      if (!exists) {
        await prisma.navItem.create({
          data: {
            label: item.label,
            path: item.path,
            sortOrder: item.sortOrder,
          },
        });
      }
    });
  }
  console.log('Navigation items seeded.');

  // 7. Seed FAQs
  const faqs = [
    { question: 'What is WarishLabs?', answer: 'WarishLabs is an engineering-first laboratory constructing premium full-stack and 3D web software.', sortOrder: 1 },
    { question: 'Can I view the source code of WarishLabs projects?', answer: 'Yes! Most of our developer tools and libraries are fully open-source on GitHub.', sortOrder: 2 },
  ];

  for (const faq of faqs) {
    const exists = await prisma.fAQ.findFirst({ where: { question: faq.question } });
    if (!exists) {
      await prisma.fAQ.create({ data: faq });
    }
  }
  console.log('FAQs seeded.');

  // 8. Seed Homepage Sections configuration
  const sections = [
    {
      sectionType: 'hero',
      title: 'We Construct High-Velocity Systems',
      subtitle: 'WarishLabs is a software laboratory building immersive 3D architectures, developer utilities, and resilient distributed platforms.',
      config: {
        ctaPrimaryText: 'Explore Products',
        ctaPrimaryUrl: '/products',
        ctaSecondaryText: 'GitHub',
        ctaSecondaryUrl: 'https://github.com/warishlabs',
        techFloating: ['nextjs', 'typescript', 'postgresql', 'threejs'],
      },
      sortOrder: 1,
    },
    {
      sectionType: 'featured-products',
      title: 'Featured Platforms',
      subtitle: 'Production software built to be reliable, fast, and satisfying to use.',
      config: {
        productSlugs: ['warishlabs-cloud', 'antigravity-engine'],
      },
      sortOrder: 2,
    },
    {
      sectionType: 'stats',
      title: 'Built by the Numbers',
      subtitle: '',
      config: {
        items: [
          { value: 12, label: 'Active Projects' },
          { value: 1800, label: 'Star Rating' },
          { value: 50, label: 'Million Requests' },
          { value: 5, label: 'Global Regions' },
        ],
      },
      sortOrder: 3,
    },
    {
      sectionType: 'about',
      title: 'About WarishLabs',
      subtitle: 'WarishLabs is a software engineering laboratory focused on building high-performance, beautiful, and highly stable developer tools and full-stack systems.',
      config: {
        philosophy: [
          "We believe that modern web applications should feel like hardware. They should be responsive, tactile, and built with extreme restraint. We avoid flashy, decorative widgets that slow down load times or distract the user.",
          "Our architectural direction is centered around strict type guarantees, relational data integrity, database-backed security systems, and highly optimized edge rendering pipelines."
        ],
        highlights: [
          { title: 'Obsessive Quality', description: 'We believe that software should be built with absolute care, strict type contracts, and solid execution guarantees.', icon: 'Shield' },
          { title: 'Modern Stack', description: 'Next.js 16 App Router, Tailwind CSS, Prisma 7, PostgreSQL, Cloudinary, and React Three Fiber.', icon: 'Cpu' },
          { title: 'WebGL Systems', description: 'Interactive visual layers rendered using hardware-accelerated 3D graphics in the browser.', icon: 'Globe' },
          { title: 'Seeded CMS', description: 'Decoupled relational schema configuration that puts content control securely in the administrative console.', icon: 'Code2' },
        ]
      },
      sortOrder: 4,
    },
    {
      sectionType: 'contact',
      title: 'Contact Us',
      subtitle: 'Have a technical inquiry, feedback, or need collaboration? Get in touch with our engineering team directly.',
      config: {
        email: 'contact@warishlabs.in',
        phone: '',
        address: 'New Delhi, India',
        responseTime: 'Under 24 hours',
        secureRouting: 'Messages are stored inside a TLS encrypted datastore and sent to resend relays.'
      },
      sortOrder: 5,
    },
  ];

  for (const sec of sections) {
    await prisma.homepageSection.upsert({
      where: { sectionType: sec.sectionType },
      update: {
        title: sec.title,
        subtitle: sec.subtitle,
        config: sec.config,
        sortOrder: sec.sortOrder,
      },
      create: {
        sectionType: sec.sectionType,
        title: sec.title,
        subtitle: sec.subtitle,
        config: sec.config,
        sortOrder: sec.sortOrder,
      },
    });
  }
  console.log('Homepage sections seeded.');

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

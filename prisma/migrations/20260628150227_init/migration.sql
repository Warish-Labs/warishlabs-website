-- 1. Create Tables Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Admin') THEN
        CREATE TABLE "Admin" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL,
            "name" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Session') THEN
        CREATE TABLE "Session" (
            "id" TEXT NOT NULL,
            "adminId" TEXT NOT NULL,
            "token" TEXT NOT NULL,
            "expiresAt" TIMESTAMP(3) NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Category') THEN
        CREATE TABLE "Category" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'CategorySEO') THEN
        CREATE TABLE "CategorySEO" (
            "id" TEXT NOT NULL,
            "categoryId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "keywords" TEXT,
            CONSTRAINT "CategorySEO_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Product') THEN
        CREATE TABLE "Product" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "tagline" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "status" TEXT NOT NULL,
            "githubUrl" TEXT,
            "visitUrl" TEXT,
            "logoUrl" TEXT,
            "categoryId" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Technology') THEN
        CREATE TABLE "Technology" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "icon" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Technology_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ProductTechnology') THEN
        CREATE TABLE "ProductTechnology" (
            "productId" TEXT NOT NULL,
            "technologyId" TEXT NOT NULL,
            CONSTRAINT "ProductTechnology_pkey" PRIMARY KEY ("productId","technologyId")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ProductMedia') THEN
        CREATE TABLE "ProductMedia" (
            "id" TEXT NOT NULL,
            "productId" TEXT NOT NULL,
            "url" TEXT NOT NULL,
            "type" TEXT NOT NULL,
            "alt" TEXT,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ProductMedia_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ProductSEO') THEN
        CREATE TABLE "ProductSEO" (
            "id" TEXT NOT NULL,
            "productId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "keywords" TEXT,
            CONSTRAINT "ProductSEO_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Blog') THEN
        CREATE TABLE "Blog" (
            "id" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "excerpt" TEXT NOT NULL,
            "coverImage" TEXT,
            "category" TEXT NOT NULL,
            "published" BOOLEAN NOT NULL DEFAULT false,
            "publishedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'BlogSEO') THEN
        CREATE TABLE "BlogSEO" (
            "id" TEXT NOT NULL,
            "blogId" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "keywords" TEXT,
            CONSTRAINT "BlogSEO_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ContactMessage') THEN
        CREATE TABLE "ContactMessage" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "subject" TEXT,
            "message" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'unread',
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'NewsletterSubscriber') THEN
        CREATE TABLE "NewsletterSubscriber" (
            "id" TEXT NOT NULL,
            "email" TEXT NOT NULL,
            "active" BOOLEAN NOT NULL DEFAULT true,
            "token" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Visitor') THEN
        CREATE TABLE "Visitor" (
            "id" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'AnalyticsEvent') THEN
        CREATE TABLE "AnalyticsEvent" (
            "id" TEXT NOT NULL,
            "visitorId" TEXT NOT NULL,
            "eventName" TEXT NOT NULL,
            "eventData" JSONB,
            "url" TEXT NOT NULL,
            "referrer" TEXT,
            "userAgent" TEXT,
            "ipAddress" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'MediaAsset') THEN
        CREATE TABLE "MediaAsset" (
            "id" TEXT NOT NULL,
            "url" TEXT NOT NULL,
            "publicId" TEXT NOT NULL,
            "fileName" TEXT NOT NULL,
            "fileSize" INTEGER NOT NULL,
            "mimeType" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'NavItem') THEN
        CREATE TABLE "NavItem" (
            "id" TEXT NOT NULL,
            "label" TEXT NOT NULL,
            "path" TEXT NOT NULL,
            "parentId" TEXT,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "NavItem_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'SiteSetting') THEN
        CREATE TABLE "SiteSetting" (
            "id" TEXT NOT NULL,
            "value" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ActivityLog') THEN
        CREATE TABLE "ActivityLog" (
            "id" TEXT NOT NULL,
            "adminId" TEXT NOT NULL,
            "action" TEXT NOT NULL,
            "details" TEXT,
            "ipAddress" TEXT,
            "userAgent" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'FAQ') THEN
        CREATE TABLE "FAQ" (
            "id" TEXT NOT NULL,
            "question" TEXT NOT NULL,
            "answer" TEXT NOT NULL,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "active" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ProductFAQ') THEN
        CREATE TABLE "ProductFAQ" (
            "id" TEXT NOT NULL,
            "productId" TEXT NOT NULL,
            "question" TEXT NOT NULL,
            "answer" TEXT NOT NULL,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "ProductFAQ_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Lab') THEN
        CREATE TABLE "Lab" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "url" TEXT,
            "githubUrl" TEXT,
            "status" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'OpenSourceProject') THEN
        CREATE TABLE "OpenSourceProject" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "slug" TEXT NOT NULL,
            "description" TEXT NOT NULL,
            "githubUrl" TEXT NOT NULL,
            "stars" INTEGER NOT NULL DEFAULT 0,
            "forks" INTEGER NOT NULL DEFAULT 0,
            "status" TEXT NOT NULL,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "OpenSourceProject_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'HomepageSection') THEN
        CREATE TABLE "HomepageSection" (
            "id" TEXT NOT NULL,
            "sectionType" TEXT NOT NULL,
            "title" TEXT,
            "subtitle" TEXT,
            "config" JSONB NOT NULL,
            "sortOrder" INTEGER NOT NULL DEFAULT 0,
            "active" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- 2. Safely Add Missing Column 'logoUrl' to Product table if it is missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'logoUrl') THEN
        ALTER TABLE "Product" ADD COLUMN "logoUrl" TEXT;
    END IF;
END $$;

-- 3. Create Indexes Safely
CREATE UNIQUE INDEX IF NOT EXISTS "Admin_email_key" ON "Admin"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "Session_adminId_idx" ON "Session"("adminId");
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "CategorySEO_categoryId_key" ON "CategorySEO"("categoryId");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "Product_categoryId_idx" ON "Product"("categoryId");
CREATE UNIQUE INDEX IF NOT EXISTS "Technology_slug_key" ON "Technology"("slug");
CREATE INDEX IF NOT EXISTS "ProductTechnology_technologyId_idx" ON "ProductTechnology"("technologyId");
CREATE INDEX IF NOT EXISTS "ProductMedia_productId_idx" ON "ProductMedia"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductSEO_productId_key" ON "ProductSEO"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "Blog_slug_key" ON "Blog"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "BlogSEO_blogId_key" ON "BlogSEO"("blogId");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_token_key" ON "NewsletterSubscriber"("token");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_visitorId_idx" ON "AnalyticsEvent"("visitorId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "MediaAsset_publicId_key" ON "MediaAsset"("publicId");
CREATE INDEX IF NOT EXISTS "NavItem_parentId_idx" ON "NavItem"("parentId");
CREATE INDEX IF NOT EXISTS "ActivityLog_adminId_idx" ON "ActivityLog"("adminId");
CREATE INDEX IF NOT EXISTS "ProductFAQ_productId_idx" ON "ProductFAQ"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "Lab_slug_key" ON "Lab"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "OpenSourceProject_slug_key" ON "OpenSourceProject"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "HomepageSection_sectionType_key" ON "HomepageSection"("sectionType");

-- 4. Add Foreign Keys Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'Session_adminId_fkey') THEN
        ALTER TABLE "Session" ADD CONSTRAINT "Session_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'CategorySEO_categoryId_fkey') THEN
        ALTER TABLE "CategorySEO" ADD CONSTRAINT "CategorySEO_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'Product_categoryId_fkey') THEN
        ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'ProductTechnology_productId_fkey') THEN
        ALTER TABLE "ProductTechnology" ADD CONSTRAINT "ProductTechnology_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'ProductTechnology_technologyId_fkey') THEN
        ALTER TABLE "ProductTechnology" ADD CONSTRAINT "ProductTechnology_technologyId_fkey" FOREIGN KEY ("technologyId") REFERENCES "Technology"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'ProductMedia_productId_fkey') THEN
        ALTER TABLE "ProductMedia" ADD CONSTRAINT "ProductMedia_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'ProductSEO_productId_fkey') THEN
        ALTER TABLE "ProductSEO" ADD CONSTRAINT "ProductSEO_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'BlogSEO_blogId_fkey') THEN
        ALTER TABLE "BlogSEO" ADD CONSTRAINT "BlogSEO_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'AnalyticsEvent_visitorId_fkey') THEN
        ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'NavItem_parentId_fkey') THEN
        ALTER TABLE "NavItem" ADD CONSTRAINT "NavItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "NavItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'ActivityLog_adminId_fkey') THEN
        ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_constraint WHERE conname = 'ProductFAQ_productId_fkey') THEN
        ALTER TABLE "ProductFAQ" ADD CONSTRAINT "ProductFAQ_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

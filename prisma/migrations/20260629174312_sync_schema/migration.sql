-- AlterTable
ALTER TABLE "Lab" ADD COLUMN     "demoUrl" TEXT,
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "techStack" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'experiment';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "displayOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showOnHomepage" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'Tool';

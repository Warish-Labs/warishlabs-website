-- DropForeignKey
ALTER TABLE "ProductTechnology" DROP CONSTRAINT "ProductTechnology_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTechnology" DROP CONSTRAINT "ProductTechnology_technologyId_fkey";

-- AlterTable
ALTER TABLE "Lab" DROP COLUMN "techStack";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "clickCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "ProductTechnology";

-- DropTable
DROP TABLE "Technology";

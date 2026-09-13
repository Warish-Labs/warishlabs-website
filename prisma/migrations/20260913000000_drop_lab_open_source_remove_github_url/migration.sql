-- DropTable: Lab
-- Reason: "Labs" positioning removed from WarishLabs. Products are real shipped software,
-- not lab experiments. The Lab table had no production data worth migrating to Product.
DROP TABLE IF EXISTS "Lab";

-- DropTable: OpenSourceProject
-- Reason: No frontend route, no admin UI, same labs-era concept. Dead code.
DROP TABLE IF EXISTS "OpenSourceProject";

-- AlterTable: Remove githubUrl from Product
-- Reason: WarishLabs decision — no repository links are ever shown to visitors.
-- Live product links only. This is a permanent architectural decision.
ALTER TABLE "Product" DROP COLUMN IF EXISTS "githubUrl";

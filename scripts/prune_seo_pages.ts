
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔥 Pruning ALL SEO Pages...");

    const count = await prisma.seoPage.count();
    console.log(`Found ${count} existing pages.`);

    if (count > 0) {
        // Also delete metrics to cascade? Prisma might handle it if cascade delete is set.
        // But metrics are high volume, so maybe separate?
        // Schema: SeoPageMetricDaily has relation fields: [pageId], references: [id]
        // Let's assume cascade or just try delete.
        try {
            await prisma.seoPageMetricDaily.deleteMany({});
            console.log("   ✓ Metrics deleted.");

            await prisma.seoPage.deleteMany({});
            console.log("   ✓ SEO Pages deleted.");
        } catch (e) {
            console.error("   ❌ Prune failed:", e);
        }
    } else {
        console.log("   - Nothing to delete.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

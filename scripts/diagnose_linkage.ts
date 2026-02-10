
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔍 Diagnosing SEO Page <-> Tariff Rate Linkage...");

    // 1. Get Active Version
    const version = await prisma.tariffVersion.findFirst({
        where: { label: "2026-FILE-SYNC" }
    });
    if (!version) throw new Error("Tariff Version '2026-FILE-SYNC' not found.");

    // 2. Get HS Codes with Rates in this version
    const rates = await prisma.tariffRate.findMany({
        where: { tariffVersionId: version.id },
        include: { hsCode: true }
    });
    const syncedHsCodes = new Set(rates.map(r => r.hsCode.hs6));
    console.log(`\n📉 Synced Rates: ${rates.length} (covering ${syncedHsCodes.size} unique HS6 codes)`);
    console.log(`   Examples: ${Array.from(syncedHsCodes).slice(0, 5).join(", ")}`);

    // 3. Get SEO Pages and their Primary HS
    const pages = await prisma.seoPage.findMany({
        take: 20, // Sample top 20
        include: {
            hsCode: true,
            productCluster: {
                include: { hsMaps: { include: { hsCode: true } } }
            }
        }
    });

    console.log(`\n📄 Checking ${pages.length} Sample SEO Pages:`);
    let matches = 0;

    for (const p of pages) {
        let pageHs = p.hsCode?.hs6;
        if (!pageHs && p.productCluster?.hsMaps.length) {
            // Pick highest confidence
            const map = p.productCluster.hsMaps.sort((a, b) => b.confidence - a.confidence)[0];
            pageHs = map.hsCode.hs6;
        }

        const hasRate = pageHs ? syncedHsCodes.has(pageHs) : false;
        if (hasRate) matches++;

        console.log(`   - Slug: ${p.slug.padEnd(40)} | HS: ${pageHs || "N/A"} | Has Rate? ${hasRate ? "✅" : "❌"}`);
    }

    console.log(`\n⚠️ Sample Match Rate: ${matches}/${pages.length}`);

    // 4. Find Orphaned SEO Pages (Count)
    // Actually we can just check how many SEO pages map to our synced HS codes.
    const allPages = await prisma.seoPage.findMany({
        select: { id: true, hsCode: { select: { hs6: true } } }
    });

    const validPages = allPages.filter(p => p.hsCode && syncedHsCodes.has(p.hsCode.hs6));
    console.log(`\n📊 Total SEO Pages linked to synced data: ${validPages.length} / ${allPages.length}`);

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

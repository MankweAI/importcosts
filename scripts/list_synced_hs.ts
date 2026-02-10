
import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🔍 Checking Available Data Clusters...");

    const version = await prisma.tariffVersion.findFirst({ where: { label: "2026-FILE-SYNC" } });
    if (!version) return;

    // Get all rates
    const rates = await prisma.tariffRate.findMany({
        where: { tariffVersionId: version.id },
        include: { hsCode: true }
    });

    const categories = new Map<string, number>();
    const validHs = [];

    for (const rate of rates) {
        const hs = rate.hsCode;
        // Naive category grouping
        let cat = "Other";
        if (hs.hs6.startsWith("8703")) cat = "Vehicles";
        else if (hs.hs6.startsWith("8528")) cat = "Monitors/TVs";
        else if (hs.hs6.startsWith("8517")) cat = "Phones";
        else if (hs.hs6.startsWith("8471")) cat = "Laptops";

        categories.set(cat, (categories.get(cat) || 0) + 1);
        validHs.push({ code: hs.hs6, title: hs.title, cat });
    }

    console.log("\n📊 Available Data Clusters (Ready for Indexing):");
    for (const [cat, count] of categories) {
        console.log(`   - ${cat}: ${count} HS Codes`);
    }

    console.log("\n❌ Legacy Clusters (Missing Data):");
    console.log("   - Solar Panels (8541...)");
    console.log("   - Batteries (8507...)");
    console.log("   - Inverters (8504...)");

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

import "dotenv/config";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Get Source Version (MVP)
    const sourceVersion = await prisma.tariffVersion.findFirst({
        where: { label: "MVP-2026-02" }
    });

    // 2. Get Target Version (FILE-SYNC / Active)
    const targetVersion = await prisma.tariffVersion.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: "desc" }
    });

    if (!sourceVersion || !targetVersion) {
        console.error("Missing source or target version");
        return;
    }
    console.log(`Copying 847130 from ${sourceVersion.label} -> ${targetVersion.label}`);

    // 3. Get HS Code
    const hsCode = await prisma.hsCode.findUnique({ where: { hs6: "847130" } });
    if (!hsCode) {
        console.error("HS Code 847130 not found");
        return;
    }

    // 4. Get Source Rate
    const sourceRate = await prisma.tariffRate.findFirst({
        where: { tariffVersionId: sourceVersion.id, hsCodeId: hsCode.id }
    });

    if (!sourceRate) {
        console.error("Source rate missing!");
        // Fallback: Create a default free rate
        console.log("Creating default FREE rate...");
        await prisma.tariffRate.create({
            data: {
                tariffVersionId: targetVersion.id,
                hsCodeId: hsCode.id,
                dutyType: "AD_VALOREM",
                adValoremPct: 0,
                notes: "Seeded for Laptops Fix"
            }
        });
    } else {
        // Copy Rate
        await prisma.tariffRate.create({
            data: {
                tariffVersionId: targetVersion.id,
                hsCodeId: hsCode.id,
                dutyType: sourceRate.dutyType,
                adValoremPct: sourceRate.adValoremPct,
                specificRule: sourceRate.specificRule ?? Prisma.JsonNull,
                compoundRule: sourceRate.compoundRule ?? Prisma.JsonNull,
                hasVatSpecialHandling: sourceRate.hasVatSpecialHandling,
                notes: sourceRate.notes
            }
        });
        console.log("Rate copied successfully.");
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

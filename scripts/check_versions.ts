import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // List ALL Active Tariff Versions
    const activeVersions = await prisma.tariffVersion.findMany({
        where: { isActive: true },
        orderBy: { effectiveFrom: "desc" }
    });
    console.log(`Found ${activeVersions.length} Active Versions:`);
    for (const v of activeVersions) {
        console.log(`- [${v.id}] ${v.label} (Effective: ${v.effectiveFrom.toISOString()})`);
    }

    if (activeVersions.length > 0) {
        const primary = activeVersions[0];
        console.log(`\nService will pick: ${primary.label}`);

        // 2. Get HS Code ID for 847130
        const hsCode = await prisma.hsCode.findUnique({
            where: { hs6: "847130" }
        });

        if (hsCode) {
            const rate = await prisma.tariffRate.findFirst({
                where: {
                    tariffVersionId: primary.id,
                    hsCodeId: hsCode.id
                }
            });
            console.log(`Rate in ${primary.label} for 847130:`, rate ? "FOUND" : "MISSING");
        } else {
            console.log("HS Code 847130 not found");
        }
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

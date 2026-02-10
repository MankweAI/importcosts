import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    // 1. Get Active Tariff Version
    const activeVersion = await prisma.tariffVersion.findFirst({
        where: { isActive: true }
    });
    console.log("Active Tariff Version:", activeVersion);

    if (!activeVersion) {
        console.error("No active tariff version found!");
        return;
    }

    // 2. Get HS Code ID for 847130
    const hsCode = await prisma.hsCode.findUnique({
        where: { hs6: "847130" }
    });
    console.log("HS Code 847130:", hsCode);

    if (!hsCode) {
        console.error("HS Code 847130 not found!");
        return;
    }

    // 3. Check for Rate in Active Version
    const rate = await prisma.tariffRate.findFirst({
        where: {
            tariffVersionId: activeVersion.id,
            hsCodeId: hsCode.id
        }
    });
    console.log("Rate for 847130:", rate);

    if (!rate) {
        console.log("!!! RATE MISSING !!!");
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

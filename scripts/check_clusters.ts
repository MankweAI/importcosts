import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const clusters = await prisma.productCluster.findMany({
        include: {
            hsMaps: {
                include: { hsCode: true },
                orderBy: { confidence: "desc" }
            }
        }
    });

    console.log("Clusters:", clusters.length);
    for (const c of clusters) {
        const hsCodes = c.hsMaps.map(m => m.hsCode.hs6).join(", ") || "NO HS CODES";
        console.log(`  ${c.slug} -> ${hsCodes}`);
    }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

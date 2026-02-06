/**
 * Master Seed Script (The "Build Pass")
 * 1. Base Seeds (Countries, Clusters, Page Shells)
 * 2. Ingests Tariffs (Creates HS keys)
 * 3. Maps Clusters -> HS
 * 4. Runs Quality Gate (INDEX vs NOINDEX)
 */

import "dotenv/config";
import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import { PrismaClient, IndexStatus } from "@prisma/client";
import { ingestTariffCsv } from "../src/lib/tariff/ingestion";
import { mapHsToCluster } from "../src/lib/db/services/productCluster.service";
import { getHsCodeByHs6 } from "../src/lib/db/services/hsCode.service";

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🚀 Starting Full Seeding & Rollout...\n");

    // 1. Run Base Seed (Countries, Clusters, 200 Page Shells)
    console.log("--- Step 1: Base Seeding ---");
    // Use the explicit flag to avoid ESM issues in the nested call
    execSync("npx ts-node --project tsconfig.scripts.json prisma/seed.ts", { stdio: "inherit" });

    // 2. Ingest Tariffs
    console.log("\n--- Step 2: Tariff Ingestion ---");
    const tariffPath = path.resolve(__dirname, "../blueprints/tariff_seed.csv");
    const tariffResult = await ingestTariffCsv(tariffPath, "2026-SEED-V1", new Date());
    console.log(`✓ Ingested Tariff Version: ${tariffResult.versionId}`);
    console.log(`✓ Total Rates: ${tariffResult.totalRates}`);

    // Activate the version for calculations
    await prisma.tariffVersion.update({
        where: { id: tariffResult.versionId },
        data: { isActive: true }
    });
    console.log("✓ Activated Tariff Version");

    // 3. Map Clusters -> HS
    console.log("\n--- Step 3: Cluster Mapping ---");
    const mapPath = path.resolve(__dirname, "../blueprints/cluster_map_seed.json");
    const mapData = JSON.parse(fs.readFileSync(mapPath, "utf-8"));

    for (const m of mapData) {
        const cluster = await prisma.productCluster.findUnique({ where: { slug: m.clusterSlug } });
        const hs = await getHsCodeByHs6(m.hs6);

        if (cluster && hs) {
            await mapHsToCluster({
                productClusterId: cluster.id,
                hsCodeId: hs.id,
                confidence: 90,
                notes: "Seed mapping"
            });
            console.log(`   Mapped ${m.clusterSlug} -> ${m.hs6}`);
        } else {
            console.warn(`   ⚠️ Could not map ${m.clusterSlug} (Missing Cluster or HS)`);
        }
    }

    // 4. Build Pass (Readiness Gate)
    console.log("\n--- Step 4: Quality Gate (Build Pass) ---");
    const allPages = await prisma.seoPage.findMany({
        include: { productCluster: { include: { hsMaps: true } } }
    });

    let indexed = 0;
    let blocked = 0;

    for (const page of allPages) {
        // Logic:
        // Must have Cluster
        // Cluster must have HS Map
        // That HS Map must have a valid Rate (we assume yes if mapped to our seed tariff)

        if (!page.productCluster) {
            continue; // Should not happen
        }

        const hasHs = page.productCluster.hsMaps.length > 0;

        if (hasHs) {
            // PASS
            await prisma.seoPage.update({
                where: { id: page.id },
                data: {
                    indexStatus: IndexStatus.INDEX,
                    readinessScore: 100,
                    lastBuiltAt: new Date()
                }
            });
            indexed++;
        } else {
            // FAIL - Stay BLOCKED
            await prisma.seoPage.update({
                where: { id: page.id },
                data: {
                    indexStatus: IndexStatus.BLOCKED_MISSING_DATA,
                    readinessScore: 0
                }
            });
            blocked++;
        }
    }

    console.log(`\n📊 Final Rollout Status:`);
    console.log(`   ✅ INDEXED: ${indexed} pages`);
    console.log(`   ⛔ NOINDEX: ${blocked} pages`);

    // Validation
    if (indexed < 10) throw new Error("Rollout failed: Too few indexed pages.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

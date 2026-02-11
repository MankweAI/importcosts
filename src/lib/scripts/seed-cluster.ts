import "dotenv/config";
import { createCluster, mapHsToCluster, upsertCluster } from "../db/services/productCluster.service";
import prisma from "../db/prisma";

async function main() {
    try {
        console.log("Seeding solar-panels cluster and HS mapping...");

        // 1. Ensure HS Code exists
        // Solar panels: 8541.43 (Photovoltaic cells assembled in modules or made up into panels)
        const hsCodeSlug = "854143";
        let hsCode = await prisma.hsCode.findFirst({ where: { hs6: hsCodeSlug } });

        if (!hsCode) {
            console.log(`Creating HS Code ${hsCodeSlug}...`);
            hsCode = await prisma.hsCode.create({
                data: {
                    hs6: hsCodeSlug,
                    title: "Photovoltaic cells assembled in modules or made up into panels",
                }
            });
        }
        console.log("HS Code ready:", hsCode.id);

        // 2. Upsert Cluster
        const cluster = await upsertCluster({
            slug: "solar-panels",
            name: "Solar Panels",
            description: "Photovoltaic cells and modules"
        });
        console.log("Cluster ready:", cluster.id);

        // 3. Map HS to Cluster
        const mapping = await mapHsToCluster({
            productClusterId: cluster.id,
            hsCodeId: hsCode.id,
            confidence: 95,
            notes: "Direct match"
        });
        console.log("Mapping created:", mapping);

    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();

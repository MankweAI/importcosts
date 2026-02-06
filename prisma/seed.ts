/**
 * Database Seed Script
 * Seeds initial data: countries, product clusters, and SEO pages
 */

import "dotenv/config";
import { PrismaClient, PageType, IndexStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "fs";
import * as path from "path";

// Create pg pool and adapter
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Country data - 10 origin countries + South Africa (destination)
const countries = [
    { iso2: "ZA", iso3: "ZAF", name: "South Africa", region: "Africa" },
    { iso2: "CN", iso3: "CHN", name: "China", region: "Asia" },
    { iso2: "US", iso3: "USA", name: "United States", region: "North America" },
    { iso2: "DE", iso3: "DEU", name: "Germany", region: "Europe" },
    { iso2: "AE", iso3: "ARE", name: "United Arab Emirates", region: "Middle East" },
    { iso2: "IN", iso3: "IND", name: "India", region: "Asia" },
    { iso2: "GB", iso3: "GBR", name: "United Kingdom", region: "Europe" },
    { iso2: "JP", iso3: "JPN", name: "Japan", region: "Asia" },
    { iso2: "IT", iso3: "ITA", name: "Italy", region: "Europe" },
    { iso2: "TR", iso3: "TUR", name: "Turkey", region: "Middle East" },
    { iso2: "VN", iso3: "VNM", name: "Vietnam", region: "Asia" },
];

// Product clusters - 20 initial clusters (Aligned with pages_seed.json)
const clusters = [
    { slug: "car-parts", name: "Car Parts", description: "Vehicle components" },
    { slug: "clothing", name: "Clothing", description: "Apparel and garments" },
    { slug: "cosmetics", name: "Cosmetics", description: "Beauty products" },
    { slug: "engine-oil", name: "Engine Oil", description: "Lubricants" },
    { slug: "furniture", name: "Furniture", description: "Home and office furniture" },
    { slug: "inverters", name: "Inverters", description: "Power inverters" },
    { slug: "kitchenware", name: "Kitchenware", description: "Kitchen utensils" },
    { slug: "laptops", name: "Laptops", description: "Notebook computers" },
    { slug: "lithium-batteries", name: "Lithium Batteries", description: "Li-ion batteries" },
    { slug: "medical-gloves", name: "Medical Gloves", description: "Disposable gloves" },
    { slug: "power-tools", name: "Power Tools", description: "Drills and saws" },
    { slug: "printers", name: "Printers", description: "Office printers" },
    { slug: "routers", name: "Routers", description: "Network routers" },
    { slug: "security-cameras", name: "Security Cameras", description: "CCTV systems" },
    { slug: "smartphones", name: "Smartphones", description: "Mobile phones" },
    { slug: "sneakers", name: "Sneakers", description: "Athletic footwear" },
    { slug: "solar-panels", name: "Solar Panels", description: "PV modules" },
    { slug: "tvs", name: "Televisions", description: "TV sets and monitors" },
    { slug: "tyres", name: "Tyres", description: "Rubber tyres" },
    { slug: "vitamins-supplements", name: "Vitamins", description: "Health supplements" },
];

type PageSeedEntry = {
    slug: string;
    pageType: string;
    indexStatus: string;
    canonicalSlug: string | null;
    readinessScore: number;
    clusterSlug: string;
    originIso2: string;
    destIso2: string;
};

async function seedCountries() {
    console.log("Seeding countries...");
    for (const country of countries) {
        await prisma.country.upsert({
            where: { iso2: country.iso2 },
            update: { name: country.name, iso3: country.iso3, region: country.region },
            create: country,
        });
    }
    console.log(`✓ Seeded ${countries.length} countries`);
}

async function seedClusters() {
    console.log("Seeding product clusters...");
    for (const cluster of clusters) {
        await prisma.productCluster.upsert({
            where: { slug: cluster.slug },
            update: { name: cluster.name, description: cluster.description },
            create: cluster,
        });
    }
    console.log(`✓ Seeded ${clusters.length} product clusters`);
}

async function seedPages() {
    console.log("Seeding SEO pages...");

    // Read pages from seed file
    const seedFilePath = path.join(__dirname, "..", "blueprints", "pages_seed.json");
    const pagesData = JSON.parse(fs.readFileSync(seedFilePath, "utf-8")) as PageSeedEntry[];

    // Get cluster ID map
    const clusterMap = new Map<string, string>();
    const allClusters = await prisma.productCluster.findMany();
    for (const c of allClusters) {
        clusterMap.set(c.slug, c.id);
    }

    let created = 0;
    let skipped = 0;

    for (const page of pagesData) {
        const clusterId = clusterMap.get(page.clusterSlug);

        if (!clusterId) {
            console.warn(`  Skipping page ${page.slug} - cluster ${page.clusterSlug} not found`);
            skipped++;
            continue;
        }

        await prisma.seoPage.upsert({
            where: { slug: page.slug },
            update: {
                readinessScore: page.readinessScore,
                indexStatus: IndexStatus.BLOCKED_MISSING_DATA, // Always start blocked
            },
            create: {
                slug: page.slug,
                pageType: page.pageType as PageType,
                indexStatus: IndexStatus.BLOCKED_MISSING_DATA,
                canonicalSlug: page.canonicalSlug,
                readinessScore: page.readinessScore,
                productClusterId: clusterId,
                originIso2: page.originIso2,
                destIso2: page.destIso2,
            },
        });
        created++;
    }

    console.log(`✓ Seeded ${created} pages (${skipped} skipped)`);
}

async function main() {
    console.log("🌱 Starting database seed...\n");

    try {
        await seedCountries();
        await seedClusters();
        await seedPages();

        console.log("\n✅ Seed completed successfully!");

        // Print summary
        const countryCount = await prisma.country.count();
        const clusterCount = await prisma.productCluster.count();
        const pageCount = await prisma.seoPage.count();

        console.log("\n📊 Database summary:");
        console.log(`   Countries: ${countryCount}`);
        console.log(`   Product Clusters: ${clusterCount}`);
        console.log(`   SEO Pages: ${pageCount}`);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();

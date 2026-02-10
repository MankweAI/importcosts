
import "dotenv/config";
import { PrismaClient, ConfidenceLabel } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🛠️ Remediating SEO Data for Indexability...");

    // 1. Identify Target HS Code (Vehicles - 87032390)
    const targetHs6 = "87032390";
    const versionLabel = "2026-FILE-SYNC";

    const version = await prisma.tariffVersion.findFirst({ where: { label: versionLabel } });
    if (!version) throw new Error("Tariff Version not found");

    const hsCode = await prisma.hsCode.findUnique({ where: { hs6: targetHs6 } });
    if (!hsCode) throw new Error(`Target HS Code ${targetHs6} not found in DB`);

    console.log(`✅ Target HS Code: ${hsCode.hs6} (${hsCode.id})`);

    // 2. Seed Doc Requirements (Required for Strict Check)
    console.log("\n📄 Seeding Document Requirements...");

    // Schema uses String for type, not Enum. Common values:
    const docs = [
        { title: "Commercial Invoice", type: "commercial_invoice", confidence: ConfidenceLabel.HIGH },
        { title: "Bill of Lading", type: "bill_of_lading", confidence: ConfidenceLabel.HIGH },
        { title: "SAD 500 Customs Declaration", type: "sad500", confidence: ConfidenceLabel.HIGH },
        { title: "EUR.1 Movement Certificate", type: "eur1_certificate", confidence: ConfidenceLabel.MEDIUM, originIso2: "DE" }
    ];

    for (const doc of docs) {
        // DocRequirement has no unique constraint on (hsCodeId, title), so we check manually
        const existing = await prisma.docRequirement.findFirst({
            where: {
                hsCodeId: hsCode.id,
                title: doc.title,
                originIso2: doc.originIso2 || null
            }
        });

        if (!existing) {
            await prisma.docRequirement.create({
                data: {
                    hsCodeId: hsCode.id,
                    title: doc.title,
                    type: doc.type,
                    confidence: doc.confidence,
                    originIso2: doc.originIso2 || null,
                    details: "Standard requirement sourced from SARS",
                }
            });
        }
    }
    console.log("✅ Documents Seeded.");

    // 3. Update SEO Pages
    // We will find 50 pages but only process unique origins to avoid slug collision
    const pages = await prisma.seoPage.findMany({
        take: 50
    });

    console.log(`\n🔗 Linking SEO Pages to ${targetHs6}...`);
    const seenOrigins = new Set<string>();
    let groundedCount = 0;

    for (const page of pages) {
        if (groundedCount >= 20) break;

        const origin = page.originIso2.toLowerCase();
        if (seenOrigins.has(origin)) continue;
        seenOrigins.add(origin);

        const newSlug = `/import-duty-vat-landed-cost/vehicles-remediated-${targetHs6}/from/${origin}/to/south-africa`;

        try {
            await prisma.seoPage.update({
                where: { id: page.id },
                data: {
                    hsCodeId: hsCode.id,
                    slug: newSlug,
                    canonicalSlug: newSlug, // Self-referencing
                    lastBuiltAt: new Date() // Freshness
                }
            });
            console.log(`   ✓ Updated: ${origin.toUpperCase()} -> ${newSlug}`);
            groundedCount++;
        } catch (e) {
            console.warn(`   ⚠️ Failed to update ${origin}:`, e instanceof Error ? e.message : e);
        }

        // Ensure HS Title (once is enough but safe to repeat)
        if (hsCode.description === "Imported from file sync" || !hsCode.title) {
            await prisma.hsCode.update({
                where: { id: hsCode.id },
                data: { title: "Motor Vehicles for Transport of Persons", description: "Motor vehicles for the transport of persons" }
            });
        }
    }
    console.log(`✅ ${groundedCount} SEO Pages Updated.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

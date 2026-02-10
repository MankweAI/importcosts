import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("📊 Database Verification Report");

    const version = await prisma.tariffVersion.findFirst({
        where: { label: "2026-FILE-SYNC" }
    });

    if (!version) {
        console.error("❌ Tariff Version '2026-FILE-SYNC' not found!");
        return;
    }
    console.log(`✓ Found Version: ${version.id}`);

    const agreements = await prisma.tradeAgreement.count();
    console.log(`✓ Trade Agreements: ${agreements}`);

    const hsCodes = await prisma.hsCode.count({
        where: { description: "Imported from file sync" }
    });
    console.log(`✓ Synced HS Codes: ${hsCodes}`);

    const mfnRates = await prisma.tariffRate.count({
        where: { tariffVersionId: version.id }
    });
    console.log(`✓ MFN Rates: ${mfnRates}`);

    const preferences = await prisma.originPreference.count({
        where: { tariffVersionId: version.id }
    });
    console.log(`✓ Origin Preferences: ${preferences}`);

    const riskFlags = await prisma.riskFlag.count();
    console.log(`✓ Risk Flags: ${riskFlags}`);

    const docRequirements = await prisma.docRequirement.count();
    console.log(`✓ Doc Requirements: ${docRequirements}`);

    const seoPages = await prisma.seoPage.count();
    console.log(`✓ SEO Pages: ${seoPages}`);

    // Sample Check
    const samplePreference = await prisma.originPreference.findFirst({
        where: { tariffVersionId: version.id },
        include: { agreement: true, origin: true, hsCode: true }
    });

    if (samplePreference) {
        console.log("\n🔎 Sample Preference:");
        console.log(`   HS: ${samplePreference.hsCode.hs6}`);
        console.log(`   Origin: ${samplePreference.origin.name} (${samplePreference.originIso2})`);
        console.log(`   Agreement: ${samplePreference.agreement.name}`);
        console.log(`   Duty: ${JSON.stringify(samplePreference.dutyOverride)}`);
        console.log(`   Notes: ${samplePreference.eligibilityNotes?.substring(0, 50)}...`);
    } else {
        console.log("\n⚠️ No preferences found to sample.");
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

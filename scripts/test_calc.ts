
import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { calculateDuty } from "../src/lib/calc/duty";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testCalc(hs6: string, value: number, weightKg: number, originCountry?: string) {
    console.log(`\n---------------------------------------------------------`);
    console.log(`Testing HS: ${hs6} | Value: R${value} | Weight: ${weightKg}kg | Origin: ${originCountry || "General"}`);

    const hsCode = await prisma.hsCode.findUnique({ where: { hs6 } });
    if (!hsCode) {
        console.log("HS Code not found");
        return;
    }

    const version = await prisma.tariffVersion.findUnique({ where: { label: "SARS-2026-02-01" } });
    if (!version) {
        console.log("Tariff Version 'SARS-2026-02-01' not found");
        return;
    }

    // 1. Get Base Rate
    let rate = await prisma.tariffRate.findFirst({
        where: { hsCodeId: hsCode.id, tariffVersionId: version.id, dutyType: { not: "ANTI_DUMPING" } }
    });

    if (!rate) {
        console.log("General Rate not found");
    } else {
        console.log(`General Rate: ${rate.dutyType} ${rate.adValoremPct ? rate.adValoremPct + "%" : ""} ${JSON.stringify(rate.specificRule || rate.compoundRule || "")}`);
    }

    // 2. Check Preference
    if (originCountry) {
        const pref = await prisma.originPreference.findFirst({
            where: {
                tariffVersionId: version.id,
                hsCodeId: hsCode.id,
                originIso2: originCountry
            },
            include: { agreement: true }
        });

        if (pref) {
            console.log(`✅ Found Preference: ${pref.agreement.code} (${pref.originIso2})`);
            const override = pref.dutyOverride as any;
            console.log(`   Override: ${override.dutyType} ${override.adValoremPct ? override.adValoremPct + "%" : ""} ${JSON.stringify(override.specificRule || override.compoundRule || "")}`);

            // Apply override
            rate = {
                ...rate,
                dutyType: override.dutyType,
                adValoremPct: override.adValoremPct ? new Prisma.Decimal(override.adValoremPct) : null,
                specificRule: override.specificRule,
                compoundRule: override.compoundRule,
            } as any;
        } else {
            console.log(`❌ No Preference found for ${originCountry}`);
        }
    }

    if (!rate) return;

    const result = calculateDuty(
        rate,
        {
            hsCode: hs6,
            customsValue: value,
            weightKg,
            quantity: 1,
            volumeLitres: 0,
            originCountry
        } as any,
        value
    );

    console.log(`Duty Payable: ${result.lineItem.amount.toFixed(2)} (${result.lineItem.formula})`);
}

async function main() {
    // 0101.21 - Horses
    // General: Free? Or check DB. 
    // Let's assume we want to test something with differential.
    // 0206.41 - Edible offal
    // General: 30% or 130c/kg. 
    // EU: Free? (Often agricultural goods are not free, but let's see).
    // SADC: Free?

    console.log("=== COMPOUND RATE TEST (General) ===");
    await testCalc("0206.41", 100, 1);       // Higher Value -> AdVal 30% (R30) vs Spec R1.30 -> R30
    await testCalc("0206.41", 1, 1);         // Lower Value -> AdVal 30c vs Spec R1.30 -> R1.30

    console.log("\n=== PREFERENTIAL RATE TEST ===");
    // Need a code that is definitely different. 
    // 8703.21 (Cars) -> General 25%, EU 18% (EPA). 
    // 0406.90 (Cheese) -> General 500c/kg with Max 96%, EU Free (under quota but tariff book says Free usually with asterisk).

    // We'll test with DE (Germany) and ZA (Internal? No, ZA is not origin for Import). 
    // US (General).

    await testCalc("0206.41", 100, 1, "US"); // Should match General
    await testCalc("0206.41", 100, 1, "DE"); // EU Rate?
    await testCalc("0206.41", 100, 1, "BW"); // SADC (Botswana) Rate?
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

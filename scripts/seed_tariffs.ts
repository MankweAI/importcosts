
import "dotenv/config";
import { PrismaClient, DutyType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Setup Prisma
// ---------------------------------------------------------------------------
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Types from JSON
// ---------------------------------------------------------------------------
type TariffRateJson = {
    general: string;
    eu_uk: string;
    efta: string;
    sadc: string;
    mercosur: string;
    afcfta: string;
};

type TariffEntry = {
    heading: string;
    cd: string;
    description: string;
    unit: string;
    rates: TariffRateJson;
};

// ---------------------------------------------------------------------------
// Constants & Helpers
// ---------------------------------------------------------------------------
const AGREEMENT_MEMBERS: Record<string, string[]> = {
    // EU (27) + UK
    "EU_UK": [
        "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK", "GB"
    ],
    // EFTA (4)
    "EFTA": ["IS", "LI", "NO", "CH"],
    // SADC (15 + ZA=Internal)
    "SADC": ["AO", "BW", "CD", "LS", "MG", "MW", "MU", "MZ", "NA", "SC", "SZ", "TZ", "ZM", "ZW"],
    // MERCOSUR (4)
    "MERCOSUR": ["AR", "BR", "PY", "UY"],
    // AfCFTA (MVP list)
    "AfCFTA": ["GH", "KE", "RW", "EG", "NG", "CM", "TN", "DZ"]
};

async function ensureTradeAgreements(tx: any) {
    const agreements = [
        { code: "EU", name: "European Union" },
        { code: "UK", name: "United Kingdom" },
        { code: "EFTA", name: "European Free Trade Association" },
        { code: "SADC", name: "Southern African Development Community" },
        { code: "MERCOSUR", name: "Southern Common Market" },
        { code: "AfCFTA", name: "African Continental Free Trade Area" }
    ];

    const map = new Map<string, string>();
    for (const ag of agreements) {
        const r = await tx.tradeAgreement.upsert({
            where: { code: ag.code },
            update: {},
            create: { code: ag.code, name: ag.name }
        });
        map.set(ag.code, r.id);
    }
    return map;
}

function parseRate(rateStr: string): {
    dutyType: DutyType;
    adValoremPct?: number;
    specificRule?: any;
    compoundRule?: any;
} {
    const lower = rateStr.toLowerCase().trim();

    // 1. FREE
    if (lower === "free" || lower === "") {
        return { dutyType: DutyType.AD_VALOREM, adValoremPct: 0 };
    }

    // 2. Ad Valorem only "15%"
    const adValoremMatch = lower.match(/^(\d+(\.\d+)?)%$/);
    if (adValoremMatch) {
        return {
            dutyType: DutyType.AD_VALOREM,
            adValoremPct: parseFloat(adValoremMatch[1]),
        };
    }

    // 3. Specific "120c/kg"
    const specificMatch = lower.match(/^(\d+(\.\d+)?)c\/([a-z]+)$/);
    if (specificMatch) {
        return {
            dutyType: DutyType.SPECIFIC,
            specificRule: {
                rate: parseFloat(specificMatch[1]),
                currency: "ZAR_CENTS",
                unit: specificMatch[3],
            },
        };
    }

    // 4. Compound / Mixed
    const normalized = lower.replace(/\s+/g, " ");

    // Pattern A: "X% or Y c/unit" -> MAX
    const maxMatch = normalized.match(/^(\d+(\.\d+)?)%\s+or\s+(\d+(\.\d+)?)c\/([a-z]+)$/);
    if (maxMatch) {
        return {
            dutyType: DutyType.COMPOUND,
            adValoremPct: parseFloat(maxMatch[1]),
            specificRule: {
                rate: parseFloat(maxMatch[3]),
                currency: "ZAR_CENTS",
                unit: maxMatch[5],
            },
            compoundRule: {
                operator: "MAX",
                raw: rateStr
            },
        };
    }

    // Pattern B: "X% or Y c/unit less Z%" -> MAX_LESS
    const maxLessMatch = normalized.match(/^(\d+(\.\d+)?)%\s+or\s+(\d+(\.\d+)?)c\/([a-z]+)\s+less\s+(\d+(\.\d+)?)%$/);
    if (maxLessMatch) {
        return {
            dutyType: DutyType.COMPOUND,
            adValoremPct: parseFloat(maxLessMatch[1]),
            specificRule: {
                rate: parseFloat(maxLessMatch[3]),
                currency: "ZAR_CENTS",
                unit: maxLessMatch[5],
            },
            compoundRule: {
                operator: "MAX_LESS",
                lessAdValoremPct: parseFloat(maxLessMatch[6]),
                raw: rateStr
            },
        };
    }

    // Pattern C: "X% plus Y c/unit" -> SUM
    const sumMatch = normalized.match(/^(\d+(\.\d+)?)%\s+plus\s+(\d+(\.\d+)?)c\/([a-z]+)$/);
    if (sumMatch) {
        return {
            dutyType: DutyType.COMPOUND,
            adValoremPct: parseFloat(sumMatch[1]),
            specificRule: {
                rate: parseFloat(sumMatch[3]),
                currency: "ZAR_CENTS",
                unit: sumMatch[5],
            },
            compoundRule: {
                operator: "SUM",
                raw: rateStr
            },
        };
    }

    // 5. "rated"
    if (lower === "rated") {
        return { dutyType: DutyType.OTHER, compoundRule: { raw: "rated" } };
    }

    // Fallback
    return {
        dutyType: DutyType.OTHER,
        compoundRule: { raw: rateStr },
    };
}

// ---------------------------------------------------------------------------
// Main Seed Function
// ---------------------------------------------------------------------------
async function seedTariffs() {
    console.log("🌱 Seeding SARS Tariffs...");

    // 1. Read JSON
    const jsonPath = path.join(__dirname, "..", "data", "sars_tariff_clean.json");
    if (!fs.existsSync(jsonPath)) {
        throw new Error(`Data file not found at ${jsonPath}`);
    }
    const data: TariffEntry[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    console.log(`Loaded ${data.length} tariff entries.`);

    // 2. Create/Get Tariff Version
    const versionLabel = "SARS-2026-02-01";
    const tariffVersion = await prisma.tariffVersion.upsert({
        where: { label: versionLabel },
        update: {},
        create: {
            label: versionLabel,
            effectiveFrom: new Date("2026-02-01"),
            publishedAt: new Date("2026-01-23"),
            isActive: true, // Auto-activate
            notes: "Imported from Schedule 1 Part 1 PDF",
        },
    });
    console.log(`Using Tariff Version: ${tariffVersion.label} (${tariffVersion.id})`);

    // 3. Process Entries
    let processed = 0;
    const batchSize = 25;

    // Ensure Agreements exist (once, globally)
    // We can do this outside the loop.
    const agreementMap = await prisma.$transaction(async (tx) => {
        return await ensureTradeAgreements(tx);
    });

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        await prisma.$transaction(
            async (tx) => {
                for (const entry of batch) {
                    const hsCodeValue = entry.heading.trim();
                    if (!hsCodeValue) continue;

                    // Upsert HsCode
                    const hsCode = await tx.hsCode.upsert({
                        where: { hs6: hsCodeValue },
                        update: { title: entry.description },
                        create: {
                            hs6: hsCodeValue,
                            title: entry.description,
                            description: entry.description,
                        },
                    });

                    // -------------------------------------------------------
                    // A. GENERAL RATES
                    // -------------------------------------------------------
                    const parsed = parseRate(entry.rates.general);

                    // Delete existing rate
                    await tx.tariffRate.deleteMany({
                        where: {
                            tariffVersionId: tariffVersion.id,
                            hsCodeId: hsCode.id,
                            dutyType: { not: DutyType.ANTI_DUMPING }
                        }
                    });

                    await tx.tariffRate.create({
                        data: {
                            tariffVersionId: tariffVersion.id,
                            hsCodeId: hsCode.id,
                            dutyType: parsed.dutyType,
                            adValoremPct: parsed.adValoremPct,
                            specificRule: parsed.specificRule,
                            compoundRule: parsed.compoundRule,
                        }
                    });

                    // -------------------------------------------------------
                    // B. PREFERENTIAL RATES
                    // -------------------------------------------------------
                    const prefColumns = [
                        { col: "eu_uk", agreements: ["EU", "UK"], members: AGREEMENT_MEMBERS["EU_UK"] },
                        { col: "efta", agreements: ["EFTA"], members: AGREEMENT_MEMBERS["EFTA"] },
                        { col: "sadc", agreements: ["SADC"], members: AGREEMENT_MEMBERS["SADC"] },
                        { col: "mercosur", agreements: ["MERCOSUR"], members: AGREEMENT_MEMBERS["MERCOSUR"] },
                        { col: "afcfta", agreements: ["AfCFTA"], members: AGREEMENT_MEMBERS["AfCFTA"] }
                    ];

                    for (const pref of prefColumns) {
                        const rawRate = (entry.rates as any)[pref.col];

                        // Only seed if there is a distinct rate. 
                        // If empty or "free", is it distinct? 
                        // "free" is distinct if General is 15%.
                        // Empty string often means "Use General" in some books, but SARS PDF usually lists it.
                        // We will assume if it's not null/underscore, we seed it.
                        if (!rawRate) continue;

                        const parsedPref = parseRate(rawRate);

                        const dutyOverride = {
                            dutyType: parsedPref.dutyType,
                            adValoremPct: parsedPref.adValoremPct,
                            specificRule: parsedPref.specificRule,
                            compoundRule: parsedPref.compoundRule
                        };

                        if (!pref.members) continue;

                        for (const iso2 of pref.members) {
                            // Correct Agreement ID
                            let agreementId = agreementMap.get(pref.agreements[0]);
                            if (pref.col === "eu_uk" && iso2 === "GB") agreementId = agreementMap.get("UK");
                            if (pref.col === "eu_uk" && iso2 !== "GB") agreementId = agreementMap.get("EU");

                            if (!agreementId) continue;

                            // Check if country exists? We seeded them.
                            // Upsert Preference
                            await tx.originPreference.upsert({
                                where: {
                                    tariffVersionId_hsCodeId_originIso2: {
                                        tariffVersionId: tariffVersion.id,
                                        hsCodeId: hsCode.id,
                                        originIso2: iso2
                                    }
                                },
                                update: {
                                    agreementId: agreementId,
                                    dutyOverride: dutyOverride as any
                                },
                                create: {
                                    tariffVersionId: tariffVersion.id,
                                    hsCodeId: hsCode.id,
                                    originIso2: iso2,
                                    agreementId: agreementId,
                                    dutyOverride: dutyOverride as any
                                }
                            });
                        }
                    }
                }
            },
            { timeout: 60000 } // Extended timeout
        );

        processed += batch.length;
        if (processed % 1000 === 0) {
            console.log(`Processed ${processed} / ${data.length} entries...`);
        }
    }

    console.log("✅ Seed completed successfully!");
}

seedTariffs()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

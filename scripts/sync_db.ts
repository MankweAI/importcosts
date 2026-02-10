/**
 * Database Synchronization Script
 * Syncs file-based data engines (rates.ts, rules.ts) to PostgreSQL
 */

import "dotenv/config";
import { PrismaClient, DutyType, IndexStatus } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PREFERENCE_RATES, MFN_RATES } from '../src/data/preferences/rates';
import { RULES_OF_ORIGIN } from '../src/data/preferences/rules';
import { COMPLIANCE_RULES } from '../src/data/compliance/rules';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TARIFF_VERSION_LABEL = "2026-FILE-SYNC";

// Mapping extracted IDs to DB Codes and Names
const AGREEMENT_MAP: Record<string, { name: string, countries: string[] }> = {
    "SADC_EU_EPA": {
        name: "SADC-EU EPA",
        countries: ["DE", "IT", "FR", "ES", "NL", "BE", "SE", "PL", "AT", "DK", "FI", "IE", "PT", "GR", "CZ", "HU", "RO", "BG", "SK", "HR", "LT", "SI", "LV", "EE", "CY", "LU", "MT"]
    },
    "SACUM_UK_EPA": {
        name: "SACUM-UK EPA",
        countries: ["GB"]
    },
    "SADC_PROTOCOL": {
        name: "SADC Protocol",
        countries: ["BW", "LS", "NA", "SZ", "MZ", "ZW", "ZM", "MW", "TZ", "AO", "CD", "MG", "MU", "SC"]
    },
    "EFTA": {
        name: "EFTA",
        countries: ["CH", "NO", "IS", "LI"]
    },
    "MERCOSUR": {
        name: "MERCOSUR",
        countries: ["BR", "AR", "UY", "PY"]
    }
};

async function main() {
    console.log("🚀 Starting Database Sync...");

    // 1. Ensure Tariff Version
    const version = await prisma.tariffVersion.upsert({
        where: { label: TARIFF_VERSION_LABEL },
        update: { isActive: true },
        create: {
            label: TARIFF_VERSION_LABEL,
            effectiveFrom: new Date(),
            isActive: true,
            notes: "Synced from file-based engine"
        }
    });
    console.log(`✓ Active Tariff Version: ${version.id}`);

    // 2. Ensure Trade Agreements
    for (const [code, details] of Object.entries(AGREEMENT_MAP)) {
        await prisma.tradeAgreement.upsert({
            where: { code },
            update: { name: details.name },
            create: { code, name: details.name }
        });
    }
    console.log(`✓ Trade Agreements Synced`);

    // 3. Process HS Codes & Rates
    // Collect all HS codes mentioned
    const allHsCodes = new Set<string>([
        ...Object.keys(MFN_RATES),
        ...Object.keys(RULES_OF_ORIGIN),
        ...COMPLIANCE_RULES.flatMap(r => r.match.hs_match)
    ]);

    // Also include preference keys
    for (const rates of Object.values(PREFERENCE_RATES)) {
        Object.keys(rates).forEach(hs => allHsCodes.add(hs));
    }

    console.log(`Processing ${allHsCodes.size} HS Codes...`);

    for (const hs6 of allHsCodes) {
        if (hs6 === "*") continue; // Skip wildcards

        // Ensure HS Code exists
        const hsCode = await prisma.hsCode.upsert({
            where: { hs6 },
            update: {},
            create: {
                hs6,
                title: `HS ${hs6}`, // Placeholder title
                description: "Imported from file sync"
            }
        });

        // Sync MFN Rate
        const mfn = MFN_RATES[hs6];
        if (mfn) {
            // Actually, simpler: delete existing rate for this version/hs and insert new.
            await prisma.tariffRate.deleteMany({
                where: { tariffVersionId: version.id, hsCodeId: hsCode.id }
            });

            await prisma.tariffRate.create({
                data: {
                    tariffVersionId: version.id,
                    hsCodeId: hsCode.id,
                    dutyType: mfn.type === 'free' ? DutyType.AD_VALOREM : DutyType.AD_VALOREM, // Mapped simple
                    adValoremPct: mfn.value ? (mfn.value * 100) : 0
                }
            });
            // Actually, simpler: delete existing rate for this version/hs and insert new.
            await prisma.tariffRate.deleteMany({
                where: { tariffVersionId: version.id, hsCodeId: hsCode.id }
            });

            await prisma.tariffRate.create({
                data: {
                    tariffVersionId: version.id,
                    hsCodeId: hsCode.id,
                    dutyType: mfn.type === 'free' ? DutyType.AD_VALOREM : DutyType.AD_VALOREM, // Mapped simple
                    adValoremPct: mfn.value ? (mfn.value * 100) : 0
                }
            });
        }
    }

    // 4. Sync Preferences & Rules
    // Get valid countries to avoid FK errors
    const dbCountries = await prisma.country.findMany({ select: { iso2: true } });
    const validIsos = new Set(dbCountries.map(c => c.iso2));

    for (const [agreementCode, ratesMap] of Object.entries(PREFERENCE_RATES)) {
        const agreement = await prisma.tradeAgreement.findUnique({ where: { code: agreementCode } });
        if (!agreement) continue;

        const targetCountries = AGREEMENT_MAP[agreementCode]?.countries || [];
        const validTargets = targetCountries.filter(c => validIsos.has(c));

        if (validTargets.length === 0) {
            console.warn(`   Skipping ${agreementCode} - no valid countries in DB (Need: ${targetCountries.join(',')})`);
            continue;
        }

        for (const [hs6, rate] of Object.entries(ratesMap)) {
            const hsCode = await prisma.hsCode.findUnique({ where: { hs6 } });
            if (!hsCode) continue;

            const rule = RULES_OF_ORIGIN[hs6]; // Check if we have rule text

            for (const iso2 of validTargets) {
                await prisma.originPreference.upsert({
                    where: {
                        tariffVersionId_hsCodeId_originIso2: {
                            tariffVersionId: version.id,
                            hsCodeId: hsCode.id,
                            originIso2: iso2
                        }
                    },
                    update: {
                        dutyOverride: {
                            type: rate.type === 'free' ? 'FREE' : 'AD_VALOREM',
                            pct: rate.value ? rate.value * 100 : 0
                        },
                        eligibilityNotes: rule?.ruleText || null
                    },
                    create: {
                        tariffVersionId: version.id,
                        hsCodeId: hsCode.id,
                        originIso2: iso2,
                        agreementId: agreement.id,
                        dutyOverride: {
                            type: rate.type === 'free' ? 'FREE' : 'AD_VALOREM',
                            pct: rate.value ? rate.value * 100 : 0
                        },
                        eligibilityNotes: rule?.ruleText || null
                    }
                });
            }
        }
    }
    console.log(`✓ Preferences Synced`);

    // 5. Sync Compliance Rules
    for (const rule of COMPLIANCE_RULES) {
        for (const hs6 of rule.match.hs_match) {
            if (hs6 === "*") continue;

            const hsCode = await prisma.hsCode.findUnique({ where: { hs6 } });
            if (!hsCode) continue;

            // Map severity
            const severityMap: Record<string, number> = { "high": 5, "medium": 3, "low": 1 };

            // Upsert RiskFlag (naive match on HS + type)
            // Since we don't have a unique key, we check findFirst
            const existing = await prisma.riskFlag.findFirst({
                where: { hsCodeId: hsCode.id, type: rule.rule_type }
            });

            if (existing) {
                await prisma.riskFlag.update({
                    where: { id: existing.id },
                    data: {
                        message: rule.summary,
                        severity: severityMap[rule.severity] || 3,
                        details: JSON.stringify(rule)
                    }
                });
            } else {
                await prisma.riskFlag.create({
                    data: {
                        hsCodeId: hsCode.id,
                        type: rule.rule_type,
                        message: rule.summary,
                        severity: severityMap[rule.severity] || 3,
                        details: JSON.stringify(rule)
                    }
                });
            }
        }
    }
    console.log(`✓ Compliance Rules Synced`);
    console.log("✅ Database Sync Complete");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

/**
 * Sync Compliance Rules Only
 * Runs the compliance sync logic that was skipped/interrupted
 */

import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { COMPLIANCE_RULES } from '../src/data/compliance/rules';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🚀 Starting Compliance Rules Sync...");

    // 5. Sync Compliance Rules
    let count = 0;
    for (const rule of COMPLIANCE_RULES) {
        for (const hs6 of rule.match.hs_match) {
            if (hs6 === "*") continue;

            const hsCode = await prisma.hsCode.findUnique({ where: { hs6 } });
            if (!hsCode) {
                console.warn(`Skipping rule for ${hs6} - HS code not found in DB`);
                continue;
            }

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
            count++;
        }
    }
    console.log(`✓ Compliance Rules Synced: ${count} flags created/updated`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

import prisma from "../db/prisma";
import { CalcInput, CalcOutput, AuditTraceStep, CalcLineItem } from "./types";
import { calculateDuty } from "./duty";
import { calculateVat } from "./vat";
import { getActiveTariffVersion } from "../db/services/tariff.service";
import { createCalcRun } from "../db/services/calcRun.service";

export async function calculateLandedCost(
    input: CalcInput,
    userId?: string
): Promise<CalcOutput> {
    const auditTrace: AuditTraceStep[] = [];
    const start = new Date();

    auditTrace.push({
        step: "INIT",
        description: "Calculation started",
        value: input,
        timestamp: new Date(),
    });

    // 1. Resolve Tariff Version
    const activeVersion = await getActiveTariffVersion();
    if (!activeVersion) {
        throw new Error("No active tariff version found");
    }

    auditTrace.push({
        step: "TARIFF_VERSION",
        description: "Resolved active tariff version",
        value: { id: activeVersion.id, label: activeVersion.label },
        timestamp: new Date(),
    });

    // 2. Resolve HS Code Rate
    // Find the rate in the active version
    const rate = await prisma.tariffRate.findFirst({
        where: {
            tariffVersionId: activeVersion.id,
            hsCodeId: (await prisma.hsCode.findUnique({ where: { hs6: input.hsCode } }))?.id || "MISSING",
        },
        include: { hsCode: true },
    });

    // Handle Missing HS Code implies "Not Found" -> Default logic?
    // MVP: Error if not found.
    let tariffRate = rate;
    if (!tariffRate) {
        // Try to find HS Code ID first
        const hsCode = await prisma.hsCode.findUnique({ where: { hs6: input.hsCode } });
        if (!hsCode) {
            throw new Error(`HS Code ${input.hsCode} not found in database`);
        }

        // If HS exists but no rate in this version -> assume FREE? or Missing?
        // MVP: Throw error "Rate not defined for this version"
        throw new Error(`Rate for HS ${input.hsCode} not defined in tariff version ${activeVersion.label}`);
    }

    auditTrace.push({
        step: "RATE_LOOKUP",
        description: "Found tariff rate",
        value: { dutyType: tariffRate.dutyType, adValorem: tariffRate.adValoremPct },
        timestamp: new Date(),
    });

    // 3. Calculate Customs Duty
    const dutyResult = calculateDuty(tariffRate, input, input.customsValue);

    dutyResult.debugLog.forEach(log => {
        auditTrace.push({
            step: "DUTY_CALC",
            description: log,
            timestamp: new Date()
        });
    });

    // 4. Calculate VAT
    const vatResult = calculateVat(input.customsValue, dutyResult.lineItem.amount);

    vatResult.debugLog.forEach(log => {
        auditTrace.push({
            step: "VAT_CALC",
            description: log,
            timestamp: new Date()
        });
    });

    // 5. Aggregate Totals
    const breakdown: CalcLineItem[] = [
        dutyResult.lineItem,
        vatResult.lineItem
    ];

    const landedCostTotal = input.customsValue + dutyResult.lineItem.amount + vatResult.lineItem.amount; // Plus freight?
    // Wait, Input has `customsValue` (ZAR). Landed Cost usually includes Freight if not already in Customs Value?
    // Customs Value is usually FOB + Freight + Insurance (CIF).
    // If input assumption is "Customs Value" = "Value for Customs purposes" (usually CIF), then we are good.
    // BUT the total cost to client = CIF + Duty + VAT + Clearance Fees etc.

    // Let's explicitly add "Item Value" line item if we want a full breakdown stack
    // breakdown.unshift({... item value ...})

    auditTrace.push({
        step: "COMPLETE",
        description: "Calculation completed successfully",
        value: { total: landedCostTotal },
        timestamp: new Date(),
    });

    // 6. Persist Run
    // Using the service we built in Phase 1
    try {
        await createCalcRun({
            userId,
            tariffVersionId: activeVersion.id,
            inputs: input as any, // Cast for Prisma JSON
            outputs: { breakdown, total: landedCostTotal } as any,
            confidence: "HIGH", // Deterministic engine = High confidence
            explain: { auditTrace } as any
        });
    } catch (e) {
        console.error("Failed to persist calculation run", e);
        // Don't fail the request, just log
    }

    return {
        landedCostTotal,
        breakdown,
        currency: "ZAR",
        tariffVersionId: activeVersion.id,
        tariffVersionLabel: activeVersion.label,
        confidence: "HIGH",
        auditTrace,
        landedCostPerUnit: input.quantity ? landedCostTotal / input.quantity : undefined
    };
}

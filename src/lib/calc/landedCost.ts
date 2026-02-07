import prisma from "../db/prisma";
import { CalcInput, CalcOutput, AuditTraceStep, CalcLineItem } from "./types";
import { calculateDuty } from "./duty";
import { calculateVat } from "./vat";
import { calculateAncillary } from "./ancillary";
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

    // 5. Calculate Ancillary Costs (Phase 8b)
    const ancillaryResult = calculateAncillary(input, input.customsValue);

    ancillaryResult.debugLog.forEach(log => {
        auditTrace.push({
            step: "ANCILLARY_CALC",
            description: log,
            timestamp: new Date()
        });
    });

    // 6. Aggregate Totals
    const breakdown: CalcLineItem[] = [
        dutyResult.lineItem,
        vatResult.lineItem,
        ...ancillaryResult.items
    ];

    const landedCostTotal = input.customsValue + dutyResult.lineItem.amount + vatResult.lineItem.amount + ancillaryResult.total;

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


    const risks: string[] = [];

    // Compliance / Risk Flags
    if (input.hsCode.startsWith("85")) {
        risks.push("Electronics: NRCS Letter of Authority (LOA) likely required.");
    }
    if (input.hsCode.startsWith("64")) {
        risks.push("Footwear: High risk of stop-and-inspect for anti-dumping checks.");
    }
    if (input.hsCode.startsWith("61") || input.hsCode.startsWith("62")) {
        risks.push("Textiles: Declare 100% correct composition to avoid seizure.");
    }
    if (landedCostTotal > 500000) {
        risks.push("High Value: Customs inspection probability increased.");
    }

    // Assumptions
    const assumptions = {
        exchangeRate: 18.50, // indicative for now, or 1.0 if strictly ZAR. Let's use a "Reference Rate" for display.
        dutyRateUsed: dutyResult.lineItem.rateApplied || "0%"
    };

    return {
        landedCostTotal,
        breakdown,
        currency: "ZAR",
        tariffVersionId: activeVersion.id,
        tariffVersionLabel: activeVersion.label,
        confidence: "HIGH",
        auditTrace,
        landedCostPerUnit: input.quantity ? landedCostTotal / input.quantity : undefined,
        risks,
        assumptions
    };
}

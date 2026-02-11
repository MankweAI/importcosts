import prisma from "../db/prisma";
import { Prisma } from "@prisma/client";
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
    // Normalize HS code to 6 digits (DB stores hs6)
    const hs6 = input.hsCode.replace(/\D/g, "").substring(0, 6);

    // Try exact hs6, then fallback to shorter prefixes
    let hsCodeRecord = await prisma.hsCode.findUnique({ where: { hs6 } });
    if (!hsCodeRecord) {
        // Try 4-digit heading match (some tariff schedules use chapter-level codes)
        const candidates = await prisma.hsCode.findMany({
            where: { hs6: { startsWith: hs6.substring(0, 4) } },
            take: 1,
        });
        if (candidates.length > 0) hsCodeRecord = candidates[0];
    }
    if (!hsCodeRecord) {
        throw new Error(`HS Code ${hs6} (from input ${input.hsCode}) not found in database`);
    }

    let tariffRate = await prisma.tariffRate.findFirst({
        where: {
            tariffVersionId: activeVersion.id,
            hsCodeId: hsCodeRecord.id,
            dutyType: { not: "ANTI_DUMPING" }
        },
        include: { hsCode: true },
    });

    // 2b. Resolve Preference (New File-Based Engine)
    let preference_decision: any = null; // using any to bypass strict type check if needed, or import PreferenceDecision

    if (input.originCountry) {
        // Determine MFN Rate Value for comparison
        let mfnRateValue = 0.0;
        if (tariffRate?.dutyType === "AD_VALOREM" && tariffRate.adValoremPct) {
            mfnRateValue = Number(tariffRate.adValoremPct);
        }

        // Call Engine
        const { resolvePreference } = await import("./preferenceEngine");
        preference_decision = resolvePreference(input.hsCode, input.originCountry, mfnRateValue);

        // Apply Best Rate if Eligible
        if (preference_decision.status === "eligible" && preference_decision.best_option?.preferential_rate) {
            const bestRate = preference_decision.best_option.preferential_rate;

            tariffRate = {
                ...tariffRate,
                dutyType: bestRate.rate_type === "free" ? "AD_VALOREM" : "AD_VALOREM", // simplified
                adValoremPct: new Prisma.Decimal(bestRate.rate_value || 0),
                specificRule: null,
                compoundRule: null,
                notes: `Preferential Rate: ${preference_decision.best_option.agreement_name}`
            } as any;

            auditTrace.push({
                step: "PREFERENCE_APPLIED",
                description: `Applied preferential rate from ${preference_decision.best_option.agreement_name}`,
                value: { rate: bestRate.rate_value, savings: preference_decision.best_option.savings_vs_mfn.savings_pct },
                timestamp: new Date()
            });
        }
    }

    // Handle Missing HS Code implies "Not Found" -> Default logic?
    // MVP: Error if not found.
    if (!tariffRate) {
        // Try to find HS Code ID first
        const hsCode = await prisma.hsCode.findUnique({ where: { hs6: input.hsCode } });
        if (!hsCode) {
            throw new Error(`HS Code ${input.hsCode} not found in database`);
        }

        // If HS exists but no rate in this version -> assume FREE? or Missing?
        // DEBUG: Log the specifics
        console.error(`[RateLookupFail] Version: ${activeVersion.label} (${activeVersion.id}) | HS: ${input.hsCode} (${hsCode.id})`);

        // MVP: Throw error "Rate not defined for this version"
        throw new Error(`Rate for HS ${input.hsCode} not defined in tariff version ${activeVersion.label}`);
    }

    auditTrace.push({
        step: "RATE_LOOKUP",
        description: "Found tariff rate",
        value: { dutyType: tariffRate.dutyType, adValorem: tariffRate.adValoremPct },
        timestamp: new Date(),
    });

    // 3. Resolve Customs Values
    // If invoiceCalc is used:
    const invoiceValueZar = (input.invoiceValue && input.exchangeRate)
        ? input.invoiceValue * input.exchangeRate
        : undefined;

    // Explicit inputs or derived from Invoice
    let productValue = invoiceValueZar !== undefined ? invoiceValueZar : (input.customsValue || 0);
    const freightInsurance = (input.incoterm && input.incoterm !== "CIF")
        ? (input.freightInsuranceCost || (input.freightCost || 0) + (input.insuranceCost || 0))
        : 0;

    // In SA, Duty is calculated on FOB (approx Product Value).
    // VAT is calculated on ATV = (FOB * 1.1) + Duty.
    // Landed Cost = Product + Freight + Duty + VAT + Fees.

    const fobValue = productValue;
    const cifValue = productValue + freightInsurance;

    auditTrace.push({
        step: "VALUE_DETERMINATION",
        description: "Determined FOB and CIF values",
        value: { fobValue, cifValue, freightInsurance, incoterm: input.incoterm },
        timestamp: new Date(),
    });

    // 4. Calculate Customs Duty (On FOB)
    const dutyResult = calculateDuty(tariffRate, input, fobValue);

    dutyResult.debugLog.forEach(log => {
        auditTrace.push({
            step: "DUTY_CALC",
            description: log,
            timestamp: new Date()
        });
    });

    // 5. Calculate VAT (On FOB base, standard ATV method)
    const vatResult = calculateVat(fobValue, dutyResult.lineItem.amount);

    vatResult.debugLog.forEach(log => {
        auditTrace.push({
            step: "VAT_CALC",
            description: log,
            timestamp: new Date()
        });
    });

    // 6. Calculate Ancillary Costs (e.g. Clearance Fees)
    // Often based on CIF or just Fixed. Phase 8b logic implies fixed or % of CIF.
    const ancillaryResult = calculateAncillary(input, cifValue);

    ancillaryResult.debugLog.forEach(log => {
        auditTrace.push({
            step: "ANCILLARY_CALC",
            description: log,
            timestamp: new Date()
        });
    });

    // 7. Aggregate Totals
    // We want a full waterfall breakdown for the UI.
    const breakdown: CalcLineItem[] = [
        {
            id: "customs_value",
            label: "Product Value (FOB)",
            amount: fobValue,
            currency: "ZAR",
            rateApplied: input.incoterm === "CIF" ? "Includes Freight" : "Excl. Freight",
            notes: "The base value of your goods converted to ZAR."
        },
        ...(freightInsurance > 0 ? [{
            id: "freight",
            label: "Freight & Insurance",
            amount: freightInsurance,
            currency: "ZAR",
            rateApplied: "Actual",
            notes: "Shipping costs to bring goods to South Africa."
        }] : []),
        dutyResult.lineItem,
        vatResult.lineItem,
        ...ancillaryResult.items
    ];

    const landedCostTotal = cifValue + dutyResult.lineItem.amount + vatResult.lineItem.amount + ancillaryResult.total;

    // Validate: product + freight + duty + vat + fees
    //         = cif + duty + vat + fees. Correct.

    const landedCostExVat = input.importerType === "VAT_REGISTERED"
        ? landedCostTotal - vatResult.lineItem.amount
        : undefined;

    auditTrace.push({
        step: "COMPLETE",
        description: "Calculation completed successfully",
        value: { total: landedCostTotal },
        timestamp: new Date(),
    });

    // 8. Persist Run
    // Skip persistence for SSR/System runs to avoid FK errors and DB bloat
    if (userId && !userId.startsWith("ssr-")) {
        try {
            await createCalcRun({
                userId,
                tariffVersionId: activeVersion.id,
                inputs: input as any, // Cast for Prisma JSON
                outputs: { breakdown, total: landedCostTotal } as any,
                confidence: "HIGH",
                explain: { auditTrace } as any
            });
        } catch (e) {
            console.error("Failed to persist calculation run", e);
        }
    }


    // 9. Risk & Viability (Phase 1 Pivot)
    const { getRiskFlags } = await import("../risk/risk.service");

    // Risks from Database Rule Engine
    const riskFlags = await getRiskFlags({
        hsCode: input.hsCode,
        clusterSlug: input.clusterSlug,
        originIso: input.originCountry
    });

    // ── Margin-Based Verdict Logic (PRD §6 Module A) ──
    // Compute per-unit cost basis for margin calculation
    const effectiveCostPerUnit = input.importerType === "VAT_REGISTERED"
        ? (landedCostExVat || landedCostTotal) / (input.quantity || 1)
        : landedCostTotal / (input.quantity || 1);

    let grossMarginPercent: number | undefined = undefined;
    let verdict: "GO" | "CAUTION" | "NOGO" = "GO";

    const hasCritical = riskFlags.some(r => r.severity === "CRITICAL");
    const hasHigh = riskFlags.some(r => r.severity === "HIGH");

    if (input.targetSellingPrice && input.targetSellingPrice > 0) {
        // Margin = (Selling - Cost) / Selling * 100
        grossMarginPercent = ((input.targetSellingPrice - effectiveCostPerUnit) / input.targetSellingPrice) * 100;

        // PRD thresholds:
        //   Go:      margin ≥ 25% AND no critical risks
        //   Caution: margin 12-24% OR high risk
        //   NoGo:    margin < 12% OR critical risk
        if (grossMarginPercent < 12 || hasCritical) {
            verdict = "NOGO";
        } else if (grossMarginPercent < 25 || hasHigh) {
            verdict = "CAUTION";
        } else {
            verdict = "GO";
        }
    } else if (input.targetMarginPercent && input.targetMarginPercent > 0) {
        // Derive selling price from target margin
        const impliedSellingPrice = effectiveCostPerUnit / (1 - input.targetMarginPercent / 100);
        grossMarginPercent = input.targetMarginPercent;

        if (grossMarginPercent < 12 || hasCritical) {
            verdict = "NOGO";
        } else if (grossMarginPercent < 25 || hasHigh) {
            verdict = "CAUTION";
        } else {
            verdict = "GO";
        }
    } else {
        // No selling price → risk-only verdict (backward compatible)
        if (hasCritical) {
            verdict = "NOGO";
        } else if (hasHigh) {
            verdict = "CAUTION";
        }
    }

    // Mapping to Output format (string severity)
    const detailedRisks = riskFlags.map(r => ({
        title: r.title,
        description: r.description,
        severity: r.severity,
        category: r.category,
        mitigation: r.mitigation
    }));

    const legacyRisks = detailedRisks.map(r => `${r.severity}: ${r.title}`);

    // Assumptions
    const assumptions = {
        exchangeRate: input.exchangeRate || 18.50,
        dutyRateUsed: dutyResult.lineItem.rateApplied || "0%",
        customsValueBase: fobValue,
        customsValueCif: cifValue,
        vatRecoverable: input.importerType === "VAT_REGISTERED"
    };

    // Compliance Risks
    const { assessRisks } = await import("../compliance/complianceEngine");
    const compliance_risks = assessRisks({
        hsCode: input.hsCode,
        originIso: input.originCountry || "CN",
        usedGoods: input.usedGoods,
        importerType: input.importerType
    });

    const breakEvenPrice = effectiveCostPerUnit;

    return {
        landedCostTotal,
        landedCostExVat,
        breakdown,
        currency: "ZAR",
        tariffVersionId: activeVersion.id,
        tariffVersionLabel: activeVersion.label,
        tariffVersionEffectiveFrom: activeVersion.effectiveFrom.toISOString(),
        confidence: "HIGH",
        auditTrace,
        landedCostPerUnit: input.quantity ? landedCostTotal / input.quantity : undefined,

        // Decision Fields
        verdict,
        grossMarginPercent,
        detailedRisks,
        breakEvenPrice,

        risks: legacyRisks,
        assumptions,
        preference_decision,
        compliance_risks
    };
}

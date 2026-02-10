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
    // Find the rate in the active version
    let tariffRate = await prisma.tariffRate.findFirst({
        where: {
            tariffVersionId: activeVersion.id,
            hsCodeId: (await prisma.hsCode.findUnique({ where: { hs6: input.hsCode } }))?.id || "MISSING",
            dutyType: { not: "ANTI_DUMPING" } // Exclude AD for base rate lookup, handle separately?
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
        exchangeRate: input.exchangeRate || 18.50, // indicative
        dutyRateUsed: dutyResult.lineItem.rateApplied || "0%",
        customsValueBase: fobValue,
        customsValueCif: cifValue,
        vatRecoverable: input.importerType === "VAT_REGISTERED"
    };

    // 10. Compliance Risks (Phase 3)
    const { assessRisks } = await import("../compliance/complianceEngine");
    const compliance_risks = assessRisks({
        hsCode: input.hsCode,
        originIso: input.originCountry || "CN", // logic for default?
        usedGoods: input.usedGoods,
        importerType: input.importerType
    });

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
        risks,
        assumptions,
        preference_decision,
        compliance_risks
    };
}

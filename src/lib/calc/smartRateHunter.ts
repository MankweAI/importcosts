/**
 * Smart Rate Hunter
 * 
 * Proactively identifies alternative sourcing origins that could offer 
 * lower landed costs through preferential trade agreements.
 * 
 * Strategy: For a given HS code + user origin, we run lightweight 
 * calculations against "strategy origins" (representative countries 
 * from each agreement zone) and return savings opportunities.
 */

import { CalcInput, CalcOutput } from "./types";
import { calculateLandedCost } from "./landedCost";
import { resolvePreference } from "./preferenceEngine";
import { assessRisks } from "../compliance/complianceEngine";

/**
 * Pre-defined "strategy origins" — one representative country per
 * trade agreement zone, plus the top non-agreement partners.
 * These are the countries we will auto-scan for better rates.
 */
export const STRATEGY_ORIGINS = [
    { iso: "DE", label: "Germany", zone: "EU (SADC-EU EPA)" },
    { iso: "GB", label: "United Kingdom", zone: "UK (SACUM-UK EPA)" },
    { iso: "BW", label: "Botswana", zone: "SADC Protocol" },
    { iso: "CN", label: "China", zone: "No Agreement (MFN)" },
    { iso: "US", label: "United States", zone: "No Agreement (MFN)" },
    { iso: "IN", label: "India", zone: "No Agreement (MFN)" },
] as const;

export interface AlternativeOrigin {
    originIso: string;
    originLabel: string;
    zone: string;
    landedCostTotal: number;
    totalTaxes: number;
    dutyAmount: number;
    dutyRate: string;
    savingsVsBase: number;              // Positive = cheaper than user's origin
    savingsPct: number;                 // Percentage savings
    hasPreference: boolean;
    preferenceStatus: string;           // "eligible" | "not_eligible" | etc.
    complianceRiskScore: number;        // 0-10
    requiredDocuments: string[];        // Extra docs needed vs base
    frictionLevel: "low" | "medium" | "high";
}

/** The single insight we surface to the importer. */
export interface ImporterInsight {
    type: "savings_found" | "best_rate";
    headline: string;
    explanation: string;
    /** Only present when type === "savings_found" */
    comparison?: {
        current: { label: string; iso: string; zone: string; dutyRate: string; landedCost: number };
        better: {
            label: string; iso: string; zone: string; dutyRate: string; landedCost: number;
            savingsAmount: number; savingsPct: number;
            tradeAgreement: string; extraDocs: string[]; frictionLevel: "low" | "medium" | "high"
        };
    };
    originsChecked: number;
}

export interface SmartRateResult {
    baseOrigin: string;
    baseLandedCost: number;
    alternatives: AlternativeOrigin[];
    bestAlternative: AlternativeOrigin | null;
    insight: ImporterInsight;
    generatedAt: string;
}

/**
 * Find better origin alternatives for a given calculation input.
 * 
 * @param baseInput - The user's original calculation input
 * @param baseResult - The user's original calculation result (avoids re-calculating)
 * @returns SmartRateResult with ranked alternatives
 */
export async function findBetterOrigins(
    baseInput: CalcInput,
    baseResult: CalcOutput
): Promise<SmartRateResult> {
    const userOrigin = baseInput.originCountry || "CN";
    const baseLandedCost = baseResult.landedCostTotal;

    // Filter out the user's current origin from strategy origins
    const originsToCheck = STRATEGY_ORIGINS.filter(o => o.iso !== userOrigin);

    // Run calculations in parallel for all strategy origins
    const alternativePromises = originsToCheck.map(async (origin) => {
        try {
            // Build a modified input with the alternative origin
            const altInput: CalcInput = {
                ...baseInput,
                originCountry: origin.iso,
                destinationCountry: "ZA",
            };

            // Run the full calculation
            const altResult = await calculateLandedCost(altInput, "ssr-rate-hunter");

            // Extract duty info from breakdown
            const dutyItem = altResult.breakdown.find(i => i.id === "duty");
            const dutyAmount = dutyItem?.amount || 0;
            const dutyRate = dutyItem?.rateApplied || "N/A";

            // Get total taxes
            const totalTaxes = altResult.breakdown
                .filter(i => ["duty", "vat", "excise"].includes(i.id))
                .reduce((sum, i) => sum + i.amount, 0);

            // Check preference status
            const preference = altResult.preference_decision;
            const hasPreference = preference?.status === "eligible";
            const preferenceStatus = preference?.status || "unknown";

            // Assess compliance risks for this origin
            const compliance = assessRisks({
                hsCode: baseInput.hsCode,
                originIso: origin.iso,
                usedGoods: baseInput.usedGoods,
                importerType: baseInput.importerType,
            });

            // Calculate savings
            const savingsVsBase = baseLandedCost - altResult.landedCostTotal;
            const savingsPct = baseLandedCost > 0
                ? (savingsVsBase / baseLandedCost) * 100
                : 0;

            // Determine required extra documents
            const extraDocs = preference?.proof_checklist || [];

            // Determine friction level based on compliance + documentation
            const frictionLevel = determineFriction(
                compliance.overall_risk_score,
                extraDocs.length,
                hasPreference
            );

            return {
                originIso: origin.iso,
                originLabel: origin.label,
                zone: origin.zone,
                landedCostTotal: altResult.landedCostTotal,
                totalTaxes,
                dutyAmount,
                dutyRate,
                savingsVsBase,
                savingsPct,
                hasPreference,
                preferenceStatus,
                complianceRiskScore: compliance.overall_risk_score,
                requiredDocuments: extraDocs,
                frictionLevel,
            } satisfies AlternativeOrigin;
        } catch (error) {
            // If calculation fails for an origin (e.g., missing rate), skip it
            console.warn(`[SmartRateHunter] Skipping ${origin.iso}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    });

    const results = await Promise.all(alternativePromises);

    // Filter out failed calculations and sort by savings (highest first)
    const alternatives = (results.filter(r => r !== null) as AlternativeOrigin[])
        .sort((a, b) => b.savingsVsBase - a.savingsVsBase);

    // Best alternative = highest savings that isn't high friction
    const bestAlternative = alternatives.find(a =>
        a.savingsVsBase > 0 && a.frictionLevel !== "high"
    ) || alternatives.find(a => a.savingsVsBase > 0) || null;

    // --- Generate Importer Insight ---
    const insight: ImporterInsight = bestAlternative && bestAlternative.savingsVsBase > 0
        ? {
            type: "savings_found",
            headline: `You could save R${bestAlternative.savingsVsBase.toLocaleString('en-ZA', { maximumFractionDigits: 0 })} by sourcing from ${bestAlternative.originLabel}`,
            explanation: bestAlternative.hasPreference
                ? `South Africa has a trade agreement with ${bestAlternative.zone.split('(')[0].trim()} that reduces duty on this product. Sourcing from ${bestAlternative.originLabel} instead of your current origin would lower your landed cost by ${bestAlternative.savingsPct.toFixed(1)}%.`
                : `${bestAlternative.originLabel} offers a lower landed cost for this product, saving you ${bestAlternative.savingsPct.toFixed(1)}% compared to your current origin.`,
            comparison: {
                current: {
                    label: STRATEGY_ORIGINS.find(o => o.iso === userOrigin)?.label || userOrigin,
                    iso: userOrigin,
                    zone: STRATEGY_ORIGINS.find(o => o.iso === userOrigin)?.zone || "Your Selection",
                    dutyRate: "—", // We don't have the base duty rate in a clean format here
                    landedCost: baseLandedCost,
                },
                better: {
                    label: bestAlternative.originLabel,
                    iso: bestAlternative.originIso,
                    zone: bestAlternative.zone,
                    dutyRate: bestAlternative.dutyRate,
                    landedCost: bestAlternative.landedCostTotal,
                    savingsAmount: bestAlternative.savingsVsBase,
                    savingsPct: bestAlternative.savingsPct,
                    tradeAgreement: bestAlternative.hasPreference ? bestAlternative.zone : "None",
                    extraDocs: bestAlternative.requiredDocuments,
                    frictionLevel: bestAlternative.frictionLevel,
                },
            },
            originsChecked: alternatives.length,
        }
        : {
            type: "best_rate",
            headline: "You're getting the best available rate",
            explanation: alternatives.every(a => a.dutyRate === "Free")
                ? "This product is duty-free regardless of origin. No trade agreement would reduce your costs further."
                : `We checked ${alternatives.length} alternative origins and none offer a lower landed cost than your current selection.`,
            originsChecked: alternatives.length,
        };

    return {
        baseOrigin: userOrigin,
        baseLandedCost,
        alternatives,
        bestAlternative,
        insight,
        generatedAt: new Date().toISOString(),
    };
}

/**
 * Determine the "friction" level of switching to an alternative origin.
 * This helps users understand the trade-off between savings and hassle.
 */
function determineFriction(
    complianceRiskScore: number,
    extraDocsCount: number,
    hasPreference: boolean
): "low" | "medium" | "high" {
    // High friction: high compliance risk OR many extra docs
    if (complianceRiskScore >= 7) return "high";

    // Medium friction: preference available but requires proof docs
    if (hasPreference && extraDocsCount > 0) return "medium";

    // Medium friction: moderate compliance risk
    if (complianceRiskScore >= 4) return "medium";

    // Low friction: no special requirements
    return "low";
}

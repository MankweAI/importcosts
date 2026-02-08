import type { TariffRate } from "@prisma/client";
import { CalcInput, CalcLineItem } from "./types";

export interface DutyResult {
    lineItem: CalcLineItem;
    debugLog: string[];
}

export function calculateDuty(
    rate: TariffRate,
    input: CalcInput,
    cifValue: number
): DutyResult {
    let amount = 0;
    let formula = "";
    let rateApplied = "";
    const debugLog: string[] = [];

    const dutyType = rate.dutyType;
    debugLog.push(`Calculating Duty: Type=${dutyType}`);

    // 1. FREE / 0%
    if (dutyType === "AD_VALOREM" && rate.adValoremPct?.toNumber() === 0) {
        return {
            lineItem: {
                id: "duty",
                label: "Customs Duty",
                amount: 0,
                currency: "ZAR",
                rateApplied: "Free",
                formula: "0%",
            },
            debugLog,
        };
    }

    // 2. AD VALOREM
    if (dutyType === "AD_VALOREM") {
        const pct = rate.adValoremPct?.toNumber() || 0;
        amount = cifValue * (pct / 100);
        rateApplied = `${pct}%`;
        formula = `${pct}% * ${cifValue.toFixed(2)}`;
        debugLog.push(`Ad Valorem: ${pct}% of ${cifValue}`);
    }

    // 3. SPECIFIC
    else if (dutyType === "SPECIFIC") {
        // Logic for specific rates (e.g., 50c / kg)
        const rule = rate.specificRule as any;
        if (rule && rule.rate && rule.unit) {
            const specificRate = Number(rule.rate); // in Rands usually, or Cents? Assuming Rands for MVP simplification
            // Note: Data seed implies Rands if not specified, but specificUnit logic needs care.
            // MVP Assumption: Unit is 'kg' or 'litre' or 'item' (pair/u)

            let qty = 0;
            if (rule.unit === "kg") qty = input.weightKg || 0;
            else if (rule.unit === "litre") qty = input.volumeLitres || 0;
            else if (rule.unit === "item" || rule.unit === "u" || rule.unit === "pair") qty = input.quantity || 0;

            amount = specificRate * qty;
            rateApplied = `R${specificRate}/${rule.unit}`;
            formula = `R${specificRate} * ${qty}${rule.unit}`;
            debugLog.push(`Specific: R${specificRate} per ${rule.unit} * ${qty}`);
        } else {
            debugLog.push("Error: Specific rate missing rule data");
        }
    }

    // 4. COMPOUND (Ad Valorem OR Specific, usually max, but sometimes AND. SA usually "Rated X% or Y whichever is greater")
    // MVP Simplification: Implement "OR specific" as distinct if needed, but for now treating as basic check.
    // Actually, SA Tariff "30% or 500c/kg" is common. 
    // Let's check `compoundRule`.
    // 4. COMPOUND (Ad Valorem OR Specific, usually max, but sometimes AND. SA usually "Rated X% or Y whichever is greater")
    else if (dutyType === "COMPOUND") {
        const adValoremPct = rate.adValoremPct?.toNumber() || 0;
        const valDuty = cifValue * (adValoremPct / 100);

        let specDuty = 0;
        const rule = rate.specificRule as any;
        let unit = "";

        if (rule) {
            const specificRate = Number(rule.rate);
            unit = rule.unit;
            let qty = 0;
            if (rule.unit === "kg") qty = input.weightKg || 0;
            else if (rule.unit === "litre") qty = input.volumeLitres || 0;
            else if (rule.unit === "item" || rule.unit === "u" || rule.unit === "pair") qty = input.quantity || 0;
            specDuty = specificRate * qty;
        }

        const compoundRule = rate.compoundRule as any;
        const operator = compoundRule?.operator || "MAX"; // Default to MAX if unknown

        if (operator === "SUM") {
            amount = valDuty + specDuty;
            rateApplied = `${adValoremPct}% + Specific`;
            formula = `${adValoremPct}% + ${specDuty.toFixed(2)}`;
            debugLog.push(`Compound (SUM): ${valDuty} + ${specDuty}`);
        }
        else if (operator === "MAX_LESS") {
            // "10% or 55c/kg less 90%" -> Max(10%, (Specific - 90% of Value))
            const lessPct = compoundRule?.lessAdValoremPct || 0;
            const lessValue = cifValue * (lessPct / 100);
            const adjustedSpec = Math.max(0, specDuty - lessValue); // Can't be negative? usually implies it zeroes out.

            if (valDuty > adjustedSpec) {
                amount = valDuty;
                rateApplied = `${adValoremPct}% (Compound)`;
                debugLog.push(`Compound (MAX_LESS): AdValorem (${valDuty}) > (Specific ${specDuty} - ${lessPct}% of Val ${lessValue})`);
            } else {
                amount = adjustedSpec;
                rateApplied = `Specific less ${lessPct}%`;
                debugLog.push(`Compound (MAX_LESS): (Specific ${specDuty} - ${lessPct}% of Val ${lessValue}) > AdValorem (${valDuty})`);
            }
        }
        else {
            // Default MAX
            if (valDuty > specDuty) {
                amount = valDuty;
                rateApplied = `${adValoremPct}% (Compound)`;
                formula = `Max(${adValoremPct}%, Spec)`;
                debugLog.push(`Compound (MAX): Ad Valorem (${valDuty}) > Specific (${specDuty})`);
            } else {
                amount = specDuty;
                rateApplied = `Specific (Compound)`;
                formula = `Max(${adValoremPct}%, Spec)`;
                debugLog.push(`Compound (MAX): Specific (${specDuty}) > Ad Valorem (${valDuty})`);
            }
        }
    }

    return {
        lineItem: {
            id: "duty",
            label: "Customs Duty",
            amount,
            currency: "ZAR",
            rateApplied,
            formula,
        },
        debugLog,
    };
}

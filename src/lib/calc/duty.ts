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
    else if (dutyType === "COMPOUND") {
        // Implement MAX logic if implied
        const pct = rate.adValoremPct?.toNumber() || 0;
        const valDuty = cifValue * (pct / 100);

        let specDuty = 0;
        const rule = rate.specificRule as any; // Using specificRule field for the specific component of compound
        if (rule) {
            // ... duplicate specific logic logic ...
            // Ideally refactor specific logic to helper.
            const specificRate = Number(rule.rate);
            let qty = 0;
            if (rule.unit === "kg") qty = input.weightKg || 0;
            else if (rule.unit === "litre") qty = input.volumeLitres || 0;
            else if (rule.unit === "item" || rule.unit === "u" || rule.unit === "pair") qty = input.quantity || 0;
            specDuty = specificRate * qty;
        }

        // SA standard "Rated ... with a maximum of ..." or "Rated ... or ... whichever is greater"
        // MVP Strategy: Take the GREATER of the two.
        if (valDuty > specDuty) {
            amount = valDuty;
            rateApplied = `${pct}% (Compound)`;
            formula = `Max(${pct}%*Val, Spec)`;
            debugLog.push(`Compound: Ad Valorem (${valDuty}) > Specific (${specDuty})`);
        } else {
            amount = specDuty;
            rateApplied = `Specific (Compound)`; // Improvements: show rate
            formula = `Max(${pct}%*Val, Spec)`;
            debugLog.push(`Compound: Specific (${specDuty}) > Ad Valorem (${valDuty})`);
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

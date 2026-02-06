import { CalcLineItem } from "./types";

export interface VatResult {
    lineItem: CalcLineItem;
    vatBasis: number;
    debugLog: string[];
}

// 10% Uplift on Customs Value + Duty
const ATV_FACTOR = 1.1;
const VAT_RATE = 0.15;

export function calculateVat(
    customsValue: number, // ATV is based on Customs Value, NOT CIF? 
    // Wait, SA SARS: "ATV = (Customs Value + 10% of Customs Value) + Duty" (Standard)
    // Actually: "ATV = (Customs Value x 1.1) + Duties" -> VAT = ATV * 15%
    // Source: SARS Guide.
    // Note: If Luxury, ATV might differ, but 1.1 is standard "Mark-up".
    dutyAmount: number
): VatResult {
    const debugLog: string[] = [];

    // Calculate ATV (Added Tax Value)
    // Formula: (Customs Value + 10%) + Duty
    const atv = (customsValue * ATV_FACTOR) + dutyAmount;

    debugLog.push(`ATV Calculation: (${customsValue} * 1.1) + ${dutyAmount} = ${atv}`);

    // Calculate VAT
    const vatAmount = atv * VAT_RATE;

    debugLog.push(`VAT Calculation: ${atv} * 0.15 = ${vatAmount}`);

    return {
        lineItem: {
            id: "vat",
            label: "VAT (15%)",
            amount: vatAmount,
            currency: "ZAR",
            rateApplied: "15%",
            formula: "15% * ((CV * 1.1) + Duty)",
            notes: "Calculated on Added Tax Value (ATV)",
        },
        vatBasis: atv,
        debugLog,
    };
}

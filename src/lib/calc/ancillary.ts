import { CalcInput, CalcLineItem } from "./types";

export interface AncillaryResult {
    items: CalcLineItem[];
    total: number;
    debugLog: string[];
}

// Industry Standard Estimates for SME Imports in ZA
const ESTIMATES = {
    FOREX_SPREAD: 0.025, // 2.5% Spread + Comms
    CLEARANCE_FEE: 1250, // Standard Entry Fee
    DISBURSEMENT_FEE: 550, // Agency Disbursement/Facilitation
    CARGO_DUES_MIN: 850, // Min for LCL
    CARGO_DUES_PCT: 0.008, // ~0.8% of Value
};

export function calculateAncillary(input: CalcInput, customsValue: number): AncillaryResult {
    const items: CalcLineItem[] = [];
    const debugLog: string[] = [];
    let total = 0;

    // 1. Forex & Merchant Fees
    // Banks charge spread + commissions. 2.5% is a safe SME buffer.
    const forexAmount = customsValue * ESTIMATES.FOREX_SPREAD;
    items.push({
        id: "forex_fees",
        label: "Forex & Merchant Fees",
        amount: forexAmount,
        currency: "ZAR",
        rateApplied: "2.5% (Est)",
        formula: "2.5% * Customs Value",
        notes: "Includes bank spread and transfer commissions.",
    });
    total += forexAmount;
    debugLog.push(`Forex: ${customsValue} * 0.025 = ${forexAmount}`);

    // 2. Clearance / Agency Fee
    items.push({
        id: "agency_fee",
        label: "Clearance & Agency Fees",
        amount: ESTIMATES.CLEARANCE_FEE,
        currency: "ZAR",
        rateApplied: "Flat",
        formula: `R${ESTIMATES.CLEARANCE_FEE}`,
        notes: "Standard Clearing Agent processing fee.",
    });
    total += ESTIMATES.CLEARANCE_FEE;
    debugLog.push(`Agency Fee: ${ESTIMATES.CLEARANCE_FEE}`);

    // 3. Port & Terminal Dues (Cargo Dues)
    // Roughly 0.8% or Min R850
    const calculatedDues = customsValue * ESTIMATES.CARGO_DUES_PCT;
    const portDues = Math.max(calculatedDues, ESTIMATES.CARGO_DUES_MIN);

    items.push({
        id: "port_dues",
        label: "Port & Terminal Dues",
        amount: portDues,
        currency: "ZAR",
        rateApplied: calculatedDues > ESTIMATES.CARGO_DUES_MIN ? "~0.8%" : "Min Charge",
        formula: `Max(0.8% * Val, R${ESTIMATES.CARGO_DUES_MIN})`,
        notes: "TNPA Cargo dues and terminal handling estimates.",
    });
    total += portDues;
    debugLog.push(`Port Dues: Max(${calculatedDues}, ${ESTIMATES.CARGO_DUES_MIN}) = ${portDues}`);

    // 4. Disbursements
    items.push({
        id: "disbursements",
        label: "Disbursements & Admin",
        amount: ESTIMATES.DISBURSEMENT_FEE,
        currency: "ZAR",
        rateApplied: "Flat",
        formula: `R${ESTIMATES.DISBURSEMENT_FEE}`,
        notes: "Documentation, facility, and communication fees.",
    });
    total += ESTIMATES.DISBURSEMENT_FEE;
    debugLog.push(`Disbursements: ${ESTIMATES.DISBURSEMENT_FEE}`);

    return { items, total, debugLog };
}

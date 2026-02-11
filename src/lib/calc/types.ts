import { ConfidenceLabel } from "@prisma/client";

export interface CalcInput {
    hsCode: string;
    customsValue: number; // In ZAR
    originCountry?: string;
    destinationCountry?: string;
    importerType?: "VAT_REGISTERED" | "NON_VENDOR";
    invoiceValue?: number;
    currency?: string;
    exchangeRate?: number;
    freightCost?: number;
    insuranceCost?: number;
    otherCharges?: number;
    quantity?: number; // Count of items
    volumeLitres?: number; // For specific duties (e.g. beverages)
    weightKg?: number; // For specific duties (e.g. heavy goods)
    incoterm?: "FOB" | "CIF" | "EXW"; // Default CIF
    freightInsuranceCost?: number; // If not CIF, add this
    usedGoods?: boolean;
    clusterSlug?: string; // Phase 1: Context for Risk Rules
    targetSellingPrice?: number; // ZAR per unit
    targetMarginPercent?: number; // e.g. 25 for 25%
}

export interface CalcLineItem {
    id: string; // e.g., "duty", "vat", "freight"
    label: string;
    amount: number;
    currency: string;
    formula?: string; // e.g., "15% * (Value + Duty)"
    notes?: string;
    rateApplied?: string; // e.g., "45%" or "110c/kg"
}

export interface AuditTraceStep {
    step: string;
    description: string;
    value?: any;
    timestamp: Date;
}

export interface CalcOutput {
    landedCostTotal: number;
    landedCostExVat?: number;
    breakdown: CalcLineItem[];
    currency: string;

    // Metadata
    tariffVersionId: string;
    tariffVersionLabel: string;
    tariffVersionEffectiveFrom?: string;
    confidence: ConfidenceLabel;
    auditTrace: AuditTraceStep[];

    // Per Unit
    landedCostPerUnit?: number;

    // Decision Support
    // Decision Support (New)
    verdict?: "GO" | "CAUTION" | "NOGO";
    grossMarginPercent?: number;
    breakEvenPrice?: number;
    detailedRisks?: {
        title: string;
        description: string;
        severity: string; // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
        category: string;
        mitigation?: string | null;
    }[];

    // Deprecated?
    risks?: string[]; // e.g., "Permit Required", "Anti-dumping duty"
    assumptions?: {
        exchangeRate: number;
        dutyRateUsed: string;
        customsValueBase?: number;
        customsValueCif?: number;
        vatRecoverable?: boolean;
    };
    preference_decision?: any; // Avoiding circular dependency for now, using any or redefine PreferenceDecision here
    compliance_risks?: any;
}

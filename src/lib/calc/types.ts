import { ConfidenceLabel } from "@prisma/client";

export interface CalcInput {
    hsCode: string;
    customsValue: number; // In ZAR
    quantity?: number; // Count of items
    volumeLitres?: number; // For specific duties (e.g. beverages)
    weightKg?: number; // For specific duties (e.g. heavy goods)
    incoterm?: "FOB" | "CIF" | "EXW"; // Default CIF
    freightInsuranceCost?: number; // If not CIF, add this
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
    breakdown: CalcLineItem[];
    currency: string;

    // Metadata
    tariffVersionId: string;
    tariffVersionLabel: string;
    confidence: ConfidenceLabel;
    auditTrace: AuditTraceStep[];

    // Per Unit
    landedCostPerUnit?: number;
}
